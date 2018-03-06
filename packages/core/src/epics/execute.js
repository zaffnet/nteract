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
import { empty } from "rxjs/observable/empty";
import { _throw } from "rxjs/observable/throw";

import {
  groupBy,
  filter,
  scan,
  map,
  mapTo,
  switchMap,
  mergeMap,
  startWith,
  mergeAll,
  takeUntil,
  catchError,
  concatMap,
  tap
} from "rxjs/operators";

import { ofType } from "redux-observable";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import * as selectors from "../selectors";

import type { ActionsObservable } from "redux-observable";

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
    payloadStream.pipe(
      // TODO: #2618
      map(payload => actions.acceptPayloadMessage({ id, payload }))
    ),

    // All actions for updating cell status
    cellMessages.pipe(
      kernelStatuses(),
      // TODO: #2618
      map(status => actions.updateCellStatus({ id, status }))
    ),

    // Update the input numbering: `[ ]`
    cellMessages.pipe(
      executionCounts(),
      // TODO: #2618
      map(ct => actions.updateCellExecutionCount({ id, value: ct }))
    ),

    // All actions for new outputs
    cellMessages.pipe(
      outputs(),
      // TODO: #2618
      map(output => actions.appendOutput({ id, output }))
    ),

    // clear_output display message
    cellMessages.pipe(
      ofMessageType("clear_output"),
      // TODO: #2618
      mapTo(actions.clearOutputs({ id }))
    )
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
  const kernel = selectors.currentKernel(store.getState());

  const channels = kernel ? kernel.channels : null;

  const kernelConnected =
    kernel &&
    channels &&
    !(kernel.status === "starting" || kernel.status === "not connected");

  if (!kernelConnected || !channels) {
    return of(actions.executeFailed(new Error("Kernel not connected!")));
  }

  const cellStream = executeCellStream(channels, id, message).pipe(
    takeUntil(
      merge(
        action$.pipe(
          ofType(actionTypes.EXECUTE_CANCELED, actionTypes.REMOVE_CELL),
          // TODO: Type this when payloads are equivalent and simplify...
          filter(
            laterAction =>
              (laterAction.payload && laterAction.payload.id === id) ||
              laterAction.id === id
          )
        ),
        action$.pipe(
          ofType(
            actionTypes.LAUNCH_KERNEL,
            actionTypes.LAUNCH_KERNEL_BY_NAME,
            actionTypes.KILL_KERNEL
          )
        )
      )
    )
  );

  return merge(
    // We make sure to propagate back to "ourselves" the actual message
    // that we sent to the kernel with the sendExecuteRequest action
    // TODO: #2618
    of(actions.sendExecuteRequest({ id, message })),
    // Merging it in with the actual stream
    cellStream
  );
}

export function executeAllCellsEpic(action$: ActionsObservable<*>, store: *) {
  return action$.pipe(
    ofType(actionTypes.EXECUTE_ALL_CELLS, actionTypes.EXECUTE_ALL_CELLS_BELOW),
    concatMap(action => {
      const state = store.getState();
      let codeCellIds = Immutable.List();

      if (action.type === actionTypes.EXECUTE_ALL_CELLS) {
        codeCellIds = selectors.currentCodeCellIds(state);
      } else if (action.type === actionTypes.EXECUTE_ALL_CELLS_BELOW) {
        codeCellIds = selectors.currentCodeCellIdsBelow(state);
      }

      return of(...codeCellIds.map(id => actions.executeCell(id)));
    })
  );
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(action$: ActionsObservable<*>, store: any) {
  return action$.pipe(
    ofType(actionTypes.EXECUTE_CELL, actionTypes.EXECUTE_FOCUSED_CELL),
    mergeMap(action => {
      if (action.type === actionTypes.EXECUTE_FOCUSED_CELL) {
        const id = selectors.currentFocusedCellId(store.getState());
        if (!id) {
          throw new Error("attempted to execute without an id");
        }
        return of(actions.executeCell(id));
      }
      return of(action);
    }),
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
        // When a new EXECUTE_CELL comes in with the current ID, we create a
        // a new stream and unsubscribe from the old one.
        switchMap(({ id }) => {
          const cellMap = selectors.currentCellMap(store.getState());

          // If for some reason this is run *outside* the context of viewing
          // a notebook (stray async task or something), it's possible that the
          // cellMap will be null;
          if (!cellMap) {
            return empty();
          }

          const cell = cellMap.get(id, Immutable.Map());

          // We only execute code cells
          if (cell.get("cell_type") !== "code") {
            return empty();
          }

          const source = cell.get("source", "");

          const message = createExecuteRequest(source);

          return createExecuteCellStream(action$, store, message, id);
        })
      )
    ),
    // Bring back all the inner Observables into one stream
    mergeAll(),
    catchError((err, source) => merge(of(actions.executeFailed(err)), source))
  );
}

export const updateDisplayEpic = (action$: ActionsObservable<*>) =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) =>
      action.payload.kernel.channels.pipe(
        ofMessageType("update_display_data"),
        // TODO: #2618
        map(msg => actions.updateDisplay({ content: msg.content })),
        // TODO: #2618
        catchError(error => of(actions.updateDisplayFailed({ error })))
      )
    )
  );
