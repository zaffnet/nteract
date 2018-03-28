// @flow
import type {
  InterruptKernel,
  KillKernelAction,
  LaunchKernelByNameAction
} from "../actionTypes";

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
import { empty } from "rxjs/observable/empty";

import { kernels, shutdown, sessions } from "rx-jupyter";
import { v4 as uuid } from "uuid";

import * as actions from "../actions";
import * as selectors from "../selectors";
import * as actionTypes from "../actionTypes";
import { castToSessionId } from "../state/ids";

import type { RemoteKernelProps } from "../state/entities/kernels";

import { executeRequest, kernelInfoRequest } from "@nteract/messaging";

export const launchWebSocketKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => selectors.isCurrentHostJupyter(store.getState())),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap((action: LaunchKernelByNameAction) => {
      const state = store.getState();
      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      const {
        payload: { kernelSpecName, cwd, kernelRef, contentRef }
      } = action;

      const content = selectors.content(state, { contentRef });
      if (!content || content.type !== "notebook") {
        return empty();
      }

      // TODO: Create a START_SESSION action instead (?)
      const sessionPayload = {
        kernel: {
          id: null,
          name: kernelSpecName
        },
        name: "",
        path: content.filepath,
        type: "notebook"
      };

      // TODO: Handle failure cases here
      return sessions.create(serverConfig, sessionPayload).pipe(
        mergeMap(data => {
          const session = data.response;

          const sessionId = castToSessionId(session.id);

          const kernel: RemoteKernelProps = Object.assign({}, session.kernel, {
            type: "websocket",
            sessionId: sessionId,
            cwd,
            channels: kernels.connect(
              serverConfig,
              session.kernel.id,
              sessionId
            ),
            kernelSpecName
          });

          kernel.channels.next(kernelInfoRequest());

          return of(
            actions.launchKernelSuccessful({
              kernel,
              kernelRef,
              contentRef: action.payload.contentRef
            })
          );
        })
      );
    })
  );

export const interruptKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(actionTypes.INTERRUPT_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(store.getState())),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap((action: InterruptKernel) => {
      const state = store.getState();

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      const kernel = selectors.currentKernel(state);
      if (!kernel) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Can't interrupt a kernel we don't have"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "websocket" || !kernel.id) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Invalid kernel type for interrupting"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      const id = kernel.id;

      return kernels.interrupt(serverConfig, id).pipe(
        map(() =>
          actions.interruptKernelSuccessful({
            kernelRef: action.payload.kernelRef
          })
        ),
        catchError(err =>
          of(
            actions.interruptKernelFailed({
              error: err,
              kernelRef: action.payload.kernelRef
            })
          )
        )
      );
    })
  );

export const killKernelEpic = (action$: *, store: *) =>
  // TODO: Use the sessions API for this
  action$.pipe(
    ofType(actionTypes.KILL_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(store.getState())),
    // If the user fires off _more_ kills, we shouldn't interrupt the in-flight
    // kill, instead doing it after the last one happens
    concatMap((action: KillKernelAction) => {
      const state = store.getState();

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      const kernel = selectors.currentKernel(state);
      if (!kernel) {
        return of(
          actions.killKernelFailed({
            error: new Error("kernel not available for killing"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "websocket" || !kernel.id || !kernel.sessionId) {
        return of(
          actions.killKernelFailed({
            error: new Error(
              "websocket kernel epic can only kill websocket kernels with an id"
            ),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      // TODO: If this was a kernel language change, we shouldn't be using this
      //       kill kernel epic because we need to make sure that creation happens
      //       after deletion
      return sessions.destroy(serverConfig, kernel.sessionId).pipe(
        map(() =>
          actions.killKernelSuccessful({
            kernelRef: action.payload.kernelRef
          })
        ),
        catchError(err =>
          of(
            actions.killKernelFailed({
              error: err,
              kernelRef: action.payload.kernelRef
            })
          )
        )
      );
    })
  );
