// @flow
import {
  createMessage,
  createExecuteRequest,
  ofMessageType,
  childOf,
  updatedOutputs,
  outputs,
  payloads,
  kernelStatuses,
  executionCounts
} from "@nteract/messaging";

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";
import { _throw } from "rxjs/observable/throw";

import type { Channels } from "@nteract/types/channels";

import type { ExecuteRequest } from "@nteract/types/messaging";

import {
  groupBy,
  filter,
  scan,
  map,
  mapTo,
  switchMap,
  startWith,
  mergeAll,
  takeUntil,
  catchError,
  tap
} from "rxjs/operators";

import { ofType } from "redux-observable";

import {
  createCellAfter,
  updateCellExecutionCount,
  updateCellStatus,
  acceptPayloadMessage,
  clearOutputs,
  appendOutput,
  updateDisplay
} from "../actions";

import type { Subject } from "rxjs/Subject";
import type { ActionsObservable } from "redux-observable";

import {
  LAUNCH_KERNEL_SUCCESSFUL,
  REMOVE_CELL,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  ERROR_UPDATE_DISPLAY,
  SEND_EXECUTE_REQUEST
} from "../actionTypes";

import type { NewKernelAction } from "../actionTypes";

const Immutable = require("immutable");

/**
 * Observe all the reactions to running code for cell with id.
 *
 * @param {Subject} channels - The standard channels specified in the Jupyter
 * specification.
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {String} code - Source code to be executed.
 * @return {Observable<Action>} updatedOutputs - It returns an observable with
 * a stream of events that need to happen after a cell has been executed.
 */
export function executeCellStream(
  channels: Channels,
  id: string,
  message: ExecuteRequest
) {
  if (!channels || !channels.pipe) {
    return _throw(new Error("kernel not connected"));
  }

  const executeRequest = message;

  // All the streams intended for all frontends
  const cellMessages = channels.pipe(childOf(executeRequest));

  // All the payload streams, intended for one user
  const payloadStream = cellMessages.pipe(payloads());

  const cellAction$ = merge(
    payloadStream.pipe(map(payload => acceptPayloadMessage(id, payload))),

    // All actions for updating cell status
    cellMessages.pipe(
      kernelStatuses(),
      map(status => updateCellStatus(id, status))
    ),

    // Update the input numbering: `[ ]`
    cellMessages.pipe(
      executionCounts(),
      map(ct => updateCellExecutionCount(id, ct))
    ),

    // All actions for new outputs
    cellMessages.pipe(outputs(), map(output => appendOutput(id, output))),

    // clear_output display message
    cellMessages.pipe(ofMessageType("clear_output"), mapTo(clearOutputs(id)))
  );

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = cellAction$.subscribe(observer);
    channels.next(executeRequest);
    return subscription;
  });
}

export function createExecuteCellStream(
  action$: ActionsObservable<*>,
  store: any,
  message: ExecuteRequest,
  id: string
) {
  const state = store.getState();

  const kernel = state.app.kernel;
  const channels = kernel ? kernel.channels : null;

  const kernelConnected =
    kernel &&
    channels &&
    !(kernel.status === "starting" || kernel.status === "not connected");

  if (!kernelConnected) {
    return of({
      type: ERROR_EXECUTING,
      payload: "Kernel not connected!",
      error: true
    });
  }

  return executeCellStream(channels, id, message).pipe(
    takeUntil(
      action$.pipe(
        filter(laterAction => laterAction.id === id),
        ofType(ABORT_EXECUTION, REMOVE_CELL)
      )
    )
  );
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(action$: ActionsObservable<*>, store: any) {
  return action$.pipe(
    ofType(SEND_EXECUTE_REQUEST),
    tap(action => {
      if (!action.id) {
        throw new Error("execute cell needs an id");
      }
    }),
    // Split stream by cell IDs
    groupBy(action => action.id),
    // Work on each cell's stream
    map(cellActionStream =>
      cellActionStream.pipe(
        // When a new SEND_EXECUTE_REQUEST comes in with the current ID, we create a
        // a new stream and unsubscribe from the old one.
        switchMap(({ message, id }) =>
          createExecuteCellStream(action$, store, message, id)
        )
      )
    ),
    // Bring back all the inner Observables into one stream
    mergeAll(),
    catchError((err, source) =>
      merge(of({ type: ERROR_EXECUTING, payload: err, error: true }), source)
    )
  );
}

export const updateDisplayEpic = (action$: ActionsObservable<*>) =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$.pipe(
    ofType(LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) =>
      action.kernel.channels.pipe(
        ofMessageType("update_display_data"),
        map(msg => updateDisplay(msg.content)),
        catchError(err =>
          of({ type: ERROR_UPDATE_DISPLAY, payload: err, error: true })
        )
      )
    )
  );
