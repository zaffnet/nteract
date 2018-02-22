/* @flow */

import { unlinkObservable } from "fs-observable";

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { empty } from "rxjs/observable/empty";
import { fromEvent } from "rxjs/observable/fromEvent";
import { merge } from "rxjs/observable/merge";

import * as fs from "fs";

import {
  filter,
  map,
  mapTo,
  tap,
  mergeMap,
  catchError,
  pluck,
  switchMap,
  concatMap,
  timeout,
  first,
  concat
} from "rxjs/operators";

import { launchSpec } from "spawnteract";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import { ipcRenderer as ipc } from "electron";

import { createMainChannel } from "enchannel-zmq-backend";
import * as jmp from "jmp";

import type { NewKernelAction } from "@nteract/core/actionTypes";

import type { KernelInfo, LocalKernelProps } from "@nteract/core/src/records";

import { createKernelRef } from "@nteract/core/records";

import { selectors, actions, actionTypes } from "@nteract/core";

import {
  createMessage,
  childOf,
  ofMessageType,
  shutdownRequest
} from "@nteract/messaging";

/**
 * Instantiate a connection to a new kernel.
 *
 * @param  {KernelInfo}  kernelSpec The kernel specs - name,language, etc
 * @param  {String}  cwd The working directory to launch the kernel in
 */
export function launchKernelObservable(kernelSpec: KernelInfo, cwd: string) {
  const spec = kernelSpec.spec;

  return Observable.create(observer => {
    launchSpec(spec, { cwd, stdio: ["ignore", "pipe", "pipe"] }).then(c => {
      const { config, spawn, connectionFile } = c;

      spawn.stdout.on("data", data => {
        const action = {
          type: actionTypes.KERNEL_RAW_STDOUT,
          payload: data.toString()
        };
        observer.next(action);
      });
      spawn.stderr.on("data", data => {
        const action = {
          type: actionTypes.KERNEL_RAW_STDERR,
          payload: data.toString()
        };
        observer.next(action);
      });

      // do dependency injection of jmp to make it match our ABI version of node
      createMainChannel(config, undefined, undefined, jmp)
        .then((channels: Channels) => {
          observer.next(actions.setNotebookKernelInfo(kernelSpec));

          const kernel: LocalKernelProps = {
            // TODO: Include the ref when we need it here
            ref: createKernelRef(),
            type: "zeromq",
            channels,
            connectionFile,
            spawn,
            cwd,
            kernelSpecName: kernelSpec.name,
            lastActivity: null,
            status: "launched" // TODO: Determine our taxonomy
          };

          observer.next(actions.launchKernelSuccessful(kernel));
          // TODO: Request status right after
          observer.next(actions.setExecutionState("launched"));
          observer.complete();
        })
        .catch(error => {
          observer.error({ type: "ERROR", payload: error, err: true });
        });
    });
  });
}

/**
 * Get kernel specs from main process
 *
 * @returns  {Observable}  The reply from main process
 */
export const kernelSpecsObservable = Observable.create(observer => {
  ipc.on("kernel_specs_reply", (event, specs) => {
    observer.next(specs);
    observer.complete();
  });
  ipc.send("kernel_specs_request");
});

export const launchKernelByNameEpic = (
  action$: ActionsObservable<*>
): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_BY_NAME),
    tap(action => {
      if (!action.kernelSpecName) {
        throw new Error("launchKernelByNameEpic requires a kernel name");
      }
    }),
    mergeMap(action =>
      kernelSpecsObservable.pipe(
        mergeMap(specs =>
          // Defer to a LAUNCH_KERNEL action to _actually_ launch
          of(actions.launchKernel(specs[action.kernelSpecName], action.cwd))
        )
      )
    )
  );

/**
 * Launches a new kernel.
 *
 * @param  {ActionObservable} action$  ActionObservable for LAUNCH_KERNEL action
 */
export const launchKernelEpic = (
  action$: ActionsObservable<*>,
  store: *
): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL),
    tap(action => {
      if (!action.kernelSpec) {
        throw new Error("launchKernel needs a kernelSpec");
      }
      ipc.send("nteract:ping:kernel", action.kernelSpec);
    }),
    // We must kill the previous kernel now
    // Then launch the next one
    switchMap(action => {
      const kernel = selectors.currentKernel(store.getState());

      return merge(
        launchKernelObservable(action.kernelSpec, action.cwd),
        // Was there a kernel before (?) -- kill it if so, otherwise nothing else
        kernel ? killKernel(kernel) : empty()
      );
    }),
    catchError((error, source) => {
      return merge(of(actions.launchKernelFailed(error)), source);
    })
  );

export const interruptKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.INTERRUPT_KERNEL),
    // This epic can only interrupt direct zeromq connected kernels
    filter(() => selectors.isCurrentKernelZeroMQ(store.getState())),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap(() => {
      const kernel = selectors.currentKernel(store.getState());

      const spawn = kernel.spawn;

      //
      // From the node.js docs
      //
      // > The ChildProcess object may emit an 'error' event if the signal cannot be delivered.
      //
      // This is instead handled in the watchSpawnEpic below
      spawn.kill("SIGINT");

      return merge(of(actions.interruptKernelSuccessful()));
    })
  );

export function killKernelImmediately(kernel: *): void {
  kernel.channels.complete();

  // Clean up all the terminal streams
  // "pause" stdin, which puts it back in its normal state
  if (kernel.spawn.stdin) {
    kernel.spawn.stdin.pause();
  }
  kernel.spawn.stdout.destroy();
  kernel.spawn.stderr.destroy();

  // Kill the process fully
  kernel.spawn.kill("SIGKILL");

  fs.unlinkSync(kernel.connectionFile);
}

function killKernel(kernel): Observable<Action> {
  const request = shutdownRequest({ restart: false });

  // Try to make a shutdown request
  // If we don't get a response within X time, force a shutdown
  // Either way do the same cleanup
  const shutDownHandling = kernel.channels.pipe(
    childOf(request),
    ofMessageType("shutdown_reply"),
    first(),
    // If we got a reply, great! :)
    map(msg => actions.shutdownReplySucceeded(msg.content)),
    // If we don't get a response within 2s, assume failure :(
    timeout(1000 * 2),
    catchError(err => of(actions.shutdownReplyTimedOut(err))),
    mergeMap(action => {
      // End all communication on the channels
      kernel.channels.complete();

      // Clean up all the terminal streams
      // "pause" stdin, which puts it back in its normal state
      if (kernel.spawn.stdin) {
        kernel.spawn.stdin.pause();
      }
      kernel.spawn.stdout.destroy();
      kernel.spawn.stderr.destroy();

      // Kill the process fully
      kernel.spawn.kill("SIGKILL");

      // Delete the connection file
      const del$ = unlinkObservable(kernel.connectionFile).pipe(
        map(() => actions.deleteConnectionFileSuccessful()),
        catchError(err => of(actions.deleteConnectionFileFailed(err)))
      );

      return merge(
        // Pass on our intermediate action
        of(action),
        // Inform about the state
        of(actions.setExecutionState("shutting down")),
        // and our connection file deletion
        del$
      );
    }),
    catchError(err =>
      // Catch all, in case there were other errors here
      of({ type: "ERROR_KILLING_KERNEL", error: true, payload: err })
    )
  );

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = shutDownHandling.subscribe(observer);
    kernel.channels.next(request);
    return subscription;
  });
}

// TODO: Switch this to a ref based setup
//
// Yet another "would be nice to have a ref" setup, since we may be switching
// from one kernel to another
//
export const killKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.KILL_KERNEL),
    // This epic can only interrupt direct zeromq connected kernels
    filter(() => selectors.isCurrentKernelZeroMQ(store.getState())),
    concatMap(action => {
      const kernel = selectors.currentKernel(store.getState());
      return killKernel(kernel);
    })
  );

export function watchSpawn(action$: *, store: *) {
  return action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) => {
      const spawn = action.kernel.spawn;
      return Observable.create(observer => {
        spawn.on("error", error => {
          // We both set the state and make it easy for us to log the error
          observer.next(actions.setExecutionState("errored"));
          observer.error({ type: "ERROR", payload: error, err: true });
          observer.complete();
        });

        spawn.on("exit", () => {
          observer.next(actions.setExecutionState("exited"));
          observer.complete();
        });
        spawn.on("disconnect", () => {
          observer.next(actions.setExecutionState("disconnected"));
          observer.complete();
        });
      });
    })
  );
}
