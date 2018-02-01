/* @flow */

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { fromEvent } from "rxjs/observable/fromEvent";
import { merge } from "rxjs/observable/merge";

import {
  filter,
  map,
  tap,
  mergeMap,
  catchError,
  first,
  pluck,
  switchMap,
  concatMap
} from "rxjs/operators";

import { launchSpec } from "spawnteract";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import { ipcRenderer as ipc } from "electron";

import { createMainChannel } from "enchannel-zmq-backend";
import * as jmp from "jmp";

import type { NewKernelAction } from "@nteract/core/actionTypes";

import type { KernelInfo, LocalKernelProps } from "@nteract/types/core/records";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import {
  setExecutionState,
  setNotebookKernelInfo,
  launchKernelSuccessful,
  interruptKernelSuccessful,
  interruptKernelFailed,
  launchKernel,
  setLanguageInfo
} from "@nteract/core/actions";

import {
  INTERRUPT_KERNEL,
  LAUNCH_KERNEL_SUCCESSFUL,
  LAUNCH_KERNEL,
  LAUNCH_KERNEL_BY_NAME,
  SET_LANGUAGE_INFO,
  ERROR_KERNEL_LAUNCH_FAILED,
  KERNEL_RAW_STDOUT,
  KERNEL_RAW_STDERR
} from "@nteract/core/actionTypes";

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
        const action = { type: KERNEL_RAW_STDOUT, payload: data.toString() };
        observer.next(action);
      });
      spawn.stderr.on("data", data => {
        const action = { type: KERNEL_RAW_STDERR, payload: data.toString() };
        observer.next(action);
      });

      // do dependency injection of jmp to make it match our ABI version of node
      createMainChannel(config, undefined, undefined, jmp)
        .then(channels => {
          observer.next(setNotebookKernelInfo(kernelSpec));

          const kernel: LocalKernelProps = {
            // TODO: Include the ref when we need it here
            channels,
            connectionFile,
            spawn,
            kernelSpecName: kernelSpec.name,
            status: "launched" // TODO: Determine our taxonomy
          };

          observer.next(launchKernelSuccessful(kernel));
        })
        .catch(error => {
          observer.error({ type: "ERROR", payload: error, err: true });
        });

      spawn.on("error", error => {
        observer.error({ type: "ERROR", payload: error, err: true });
        observer.complete();
      });

      spawn.on("exit", () => {
        observer.complete();
      });
      spawn.on("disconnect", () => {
        observer.complete();
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

export const launchKernelByNameEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL_BY_NAME),
    tap(action => {
      if (!action.kernelSpecName) {
        throw new Error("launchKernelByNameEpic requires a kernel name");
      }
    }),
    mergeMap(action =>
      kernelSpecsObservable.pipe(
        mergeMap(specs =>
          // Defer to a LAUNCH_KERNEL action to _actually_ launch
          of(launchKernel(specs[action.kernelSpecName], action.cwd))
        )
      )
    )
  );

/**
 * Launches a new kernel.
 *
 * @param  {ActionObservable} action$  ActionObservable for LAUNCH_KERNEL action
 */
export const launchKernelEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL),
    tap(action => {
      if (!action.kernelSpec) {
        throw new Error("launchKernel needs a kernelSpec");
      }
      ipc.send("nteract:ping:kernel", action.kernelSpec);
    }),
    mergeMap(action => launchKernelObservable(action.kernelSpec, action.cwd)),
    catchError((error, source) =>
      merge(
        of({
          type: ERROR_KERNEL_LAUNCH_FAILED,
          payload: error,
          error: true
        }),
        source
      )
    )
  );

export const interruptKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(INTERRUPT_KERNEL),
    filter(() => {
      const state = store.getState();
      const host = state.app.host;
      const kernel = state.app.kernel;

      // This epic can only interrupt direct zeromq connected kernels
      return (
        host &&
        kernel &&
        host.type === "local" &&
        kernel.type === "zeromq" &&
        kernel.spawn
      );
    }),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap(() => {
      const state = store.getState();
      const kernel = state.app.kernel;

      const spawn = kernel.spawn;

      //
      // From the node.js docs
      //
      // > The ChildProcess object may emit an 'error' event if the signal cannot be delivered.
      //
      // We have other error handling (above) in the kernel launch epic for the spawn
      // We probably want to route errors to actions from that handling, in which case we
      // will unconditionally say that it was successful (we have no other indication)
      //
      spawn.kill("SIGINT");

      return merge(
        of(interruptKernelSuccessful())
        // Since the error handling for spawn is registered upon launch, we'll
        // not register some event handling
        /*fromEvent(spawn, "error").pipe(
          map(error => interruptKernelFailed(error))
        )*/
        // TODO: Consider requesting kernel status and expecting a response
        //       within some amount of time
      );
    })
  );
