/* @flow */
import type { KernelRef } from "@nteract/core/src/state";
import { unlinkObservable } from "fs-observable";

import type { ChildProcess } from "child_process";

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

import type { NewKernelAction } from "@nteract/core/src/actionTypes";

import type { KernelInfo, LocalKernelProps } from "@nteract/core/src/state";

import { selectors, actions, actionTypes, state } from "@nteract/core";

import {
  createMessage,
  childOf,
  ofMessageType,
  shutdownRequest
} from "@nteract/messaging";
import type {
  InterruptKernel,
  LaunchKernelAction,
  LaunchKernelByNameAction,
  KillKernelAction
} from "@nteract/core/src/actionTypes";

/**
 * Instantiate a connection to a new kernel.
 *
 * @param  {KernelInfo}  kernelSpec The kernel specs - name,language, etc
 * @param  {String}  cwd The working directory to launch the kernel in
 */
export function launchKernelObservable(
  kernelSpec: KernelInfo,
  cwd: string,
  kernelRef: KernelRef
) {
  const spec = kernelSpec.spec;

  return Observable.create(observer => {
    launchSpec(spec, { cwd, stdio: ["ignore", "pipe", "pipe"] }).then(c => {
      const { config, spawn, connectionFile } = c;

      spawn.stdout.on("data", data => {
        observer.next(
          actions.kernelRawStdout({ text: data.toString(), kernelRef })
        );
      });
      spawn.stderr.on("data", data => {
        observer.next(
          actions.kernelRawStderr({ text: data.toString(), kernelRef })
        );
      });

      // do dependency injection of jmp to make it match our ABI version of node
      createMainChannel(config, undefined, undefined, jmp)
        .then((channels: Channels) => {
          observer.next(actions.setNotebookKernelInfo(kernelSpec));

          const kernel: LocalKernelProps = {
            kernelRef: state.createKernelRef(),
            type: "zeromq",
            hostRef: null,
            channels,
            connectionFile,
            spawn,
            cwd,
            kernelSpecName: kernelSpec.name,
            lastActivity: null,
            status: "launched" // TODO: Determine our taxonomy
          };

          observer.next(actions.launchKernelSuccessful({ kernel, kernelRef }));
          // TODO: Request status right after
          observer.next(
            actions.setExecutionState({ kernelStatus: "launched", kernelRef })
          );
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
    tap((action: LaunchKernelByNameAction) => {
      if (!action.payload.kernelSpecName) {
        throw new Error("launchKernelByNameEpic requires a kernel name");
      }
    }),
    mergeMap((action: LaunchKernelByNameAction) =>
      kernelSpecsObservable.pipe(
        mergeMap(specs =>
          // Defer to a launchKernel action to _actually_ launch
          of(
            actions.launchKernel({
              kernelSpec: specs[action.payload.kernelSpecName],
              cwd: action.payload.cwd,
              kernelRef: action.payload.kernelRef,
              selectNextKernel: action.payload.selectNextKernel
            })
          )
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
    // We must kill the previous kernel now
    // Then launch the next one
    switchMap((action: LaunchKernelAction) => {
      if (
        !action.payload ||
        !action.payload.kernelSpec ||
        !action.payload.kernelRef
      ) {
        return of(
          actions.launchKernelFailed({
            error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
            kernelRef: action.payload && action.payload.kernelRef
          })
        );
      }

      // TODO: Do the async version of `ipc.send`, potentially coordinate with main process
      ipc.send("nteract:ping:kernel", action.payload.kernelSpec);

      let cleanupOldKernel$ = empty();

      // Kill the old kernel by emitting the action to kill it
      const oldKernelRef = selectors.currentKernelRef(store.getState());
      if (oldKernelRef && oldKernelRef !== action.payloadRef) {
        cleanupOldKernel$ = of(
          actions.killKernel({ restarting: false, kernelRef: oldKernelRef })
        );
      }

      return merge(
        launchKernelObservable(
          action.payload.kernelSpec,
          action.payload.cwd,
          action.payload.kernelRef
        ),
        // Was there a kernel before (?) -- kill it if so, otherwise nothing else
        cleanupOldKernel$
      ).pipe(
        catchError((error: Error) =>
          of(
            actions.launchKernelFailed({
              error,
              kernelRef: action.payload.kernelRef
            })
          )
        )
      );
    }),
    // TODO: ask @jayphelps about `merge(of(errorAction), source)` replaying the
    // original action
    catchError((error: Error) => {
      return of({ type: "ERROR", payload: error, error: true });
    })
  );

export const interruptKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.INTERRUPT_KERNEL),
    // This epic can only interrupt direct zeromq connected kernels
    filter(() => selectors.isCurrentKernelZeroMQ(store.getState())),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap((action: InterruptKernel) => {
      const kernel = selectors.currentKernel(store.getState());

      const spawn = kernel.spawn;

      //
      // From the node.js docs
      //
      // > The ChildProcess object may emit an 'error' event if the signal cannot be delivered.
      //
      // This is instead handled in the watchSpawnEpic below
      spawn.kill("SIGINT");

      return merge(
        of(
          actions.interruptKernelSuccessful({
            kernelRef: action.payload.kernelRef
          })
        )
      );
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

export const killKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.KILL_KERNEL),
    // This epic can only kill direct zeromq connected kernels
    filter(() => selectors.isCurrentKernelZeroMQ(store.getState())),
    concatMap((action: KillKernelAction) => {
      const state = store.getState();
      const kernelRef = action.payload.kernelRef;
      const kernel = selectors.kernel(state, { kernelRef });
      const request = shutdownRequest({ restart: false });

      // Try to make a shutdown request
      // If we don't get a response within X time, force a shutdown
      // Either way do the same cleanup
      const shutDownHandling = kernel.channels.pipe(
        childOf(request),
        ofMessageType("shutdown_reply"),
        first(),
        // If we got a reply, great! :)
        map(msg =>
          actions.shutdownReplySucceeded({ text: msg.content, kernelRef })
        ),
        // If we don't get a response within 2s, assume failure :(
        timeout(1000 * 2),
        catchError(err =>
          of(actions.shutdownReplyTimedOut({ error: err, kernelRef }))
        ),
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
            map(() => actions.deleteConnectionFileSuccessful({ kernelRef })),
            catchError(err =>
              of(actions.deleteConnectionFileFailed({ error: err, kernelRef }))
            )
          );

          return merge(
            // Pass on our intermediate action
            of(action),
            // Inform about the state
            of(
              actions.setExecutionState({
                kernelStatus: "shutting down",
                kernelRef
              })
            ),
            // and our connection file deletion
            del$
          );
        }),
        catchError(err =>
          // Catch all, in case there were other errors here
          of(actions.killKernelFailed({ error: err, kernelRef }))
        )
      );

      // On subscription, send the message
      return Observable.create(observer => {
        const subscription = shutDownHandling.subscribe(observer);
        kernel.channels.next(request);
        return subscription;
      });
    })
  );

export function watchSpawn(action$: *, store: *) {
  return action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) => {
      if (!action.payload.kernel.type === "zeromq") {
        throw new Error("kernel.type is not zeromq.");
      }
      // $FlowFixMe: spawn's type seems not to be defined.
      if (!action.payload.kernel.spawn) {
        throw new Error("kernel.spawn is not provided.");
      }
      const spawn: ChildProcess = action.payload.kernel.spawn;
      return Observable.create(observer => {
        spawn.on("error", error => {
          // We both set the state and make it easy for us to log the error
          observer.next(
            actions.setExecutionState({
              kernelStatus: "errored",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.error({ type: "ERROR", payload: error, err: true });
          observer.complete();
        });
        spawn.on("exit", () => {
          observer.next(
            actions.setExecutionState({
              kernelStatus: "exited",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.complete();
        });
        spawn.on("disconnect", () => {
          observer.next(
            actions.setExecutionState({
              kernelStatus: "disconnected",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.complete();
        });
      });
    })
  );
}
