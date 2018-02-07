// @flow

import { ofType } from "redux-observable";

import {
  catchError,
  map,
  mergeMap,
  switchMap,
  concatMap,
  filter
} from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";

import {
  launchKernelSuccessful,
  interruptKernelSuccessful,
  interruptKernelFailed
} from "../actions";

import type { AppState, RemoteKernelProps } from "@nteract/types/core/records";

import { kernels, shutdown } from "rx-jupyter";
import { v4 as uuid } from "uuid";

import {
  getServerConfig,
  isCurrentHostJupyter,
  isCurrentKernelJupyterWebsocket
} from "../selectors";

import {
  LAUNCH_KERNEL,
  LAUNCH_KERNEL_BY_NAME,
  LAUNCH_KERNEL_SUCCESSFUL,
  INTERRUPT_KERNEL
} from "../actionTypes";

import { executeRequest, kernelInfoRequest } from "@nteract/messaging";

export const launchWebSocketKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => isCurrentHostJupyter(store.getState())),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap(({ kernelSpecName, cwd }) => {
      const config = getServerConfig(store.getState());

      return kernels.start(config, kernelSpecName, cwd).pipe(
        mergeMap(data => {
          const session = uuid();

          const kernel = Object.assign({}, data.response, {
            type: "websocket",
            channels: kernels.connect(config, data.response.id, session),
            kernelSpecName
          });

          kernel.channels.next(kernelInfoRequest());

          return of(launchKernelSuccessful(kernel));
        })
      );
    })
  );

export const interruptKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(INTERRUPT_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => isCurrentKernelJupyterWebsocket(store.getState())),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap(() => {
      const state = store.getState();
      const serverConfig = getServerConfig(state);
      const id = state.app.kernel.id;

      return kernels
        .interrupt(serverConfig, id)
        .pipe(
          map(() => interruptKernelSuccessful()),
          catchError(err => interruptKernelFailed(err))
        );
    })
  );
