/* @flow */

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { from } from "rxjs/observable/from";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

const path = require("path");

import {
  filter,
  map,
  tap,
  mergeMap,
  concatMap,
  catchError,
  first,
  pluck,
  switchMap
} from "rxjs/operators";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import type { NewKernelAction, SetNotebookAction } from "../actionTypes";

import type { KernelInfo } from "../records";

import * as selectors from "../selectors";
import * as actions from "../actions";
import * as actionTypes from "../actionTypes";

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for LAUNCH_KERNEL_SUCCESSFUL action
 */
export const watchExecutionStateEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) =>
      action.kernel.channels.pipe(
        filter(msg => msg.header.msg_type === "status"),
        map(msg => actions.setExecutionState(msg.content.execution_state))
      )
    )
  );

/**
 * Send a kernel_info_request to the kernel.
 *
 * @param  {Object}  channels  A object containing the kernel channels
 * @returns  {Observable}  The reply from the server
 */
export function acquireKernelInfo(channels: Channels) {
  const message = createMessage("kernel_info_request");

  const obs = channels.pipe(
    childOf(message),
    ofMessageType("kernel_info_reply"),
    first(),
    pluck("content", "language_info"),
    map(actions.setLanguageInfo)
  );

  return Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.next(message);
    return subscription;
  });
}

/**
 * Gets information about newly launched kernel.
 *
 * @param  {ActionObservable}  The action type
 */
export const acquireKernelInfoEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap(action => acquireKernelInfo(action.kernel.channels))
  );

export const extractNewKernel = (
  filename: ?string,
  notebook: ImmutableNotebook
) => {
  // TODO: There's some incongruence between desktop and web app here, regarding path vs. filename
  const cwd = (filename && path.dirname(filename)) || "/";

  const kernelSpecName = notebook.getIn(
    ["metadata", "kernelspec", "name"],
    notebook.getIn(["metadata", "language_info", "name"], "python3")
  );

  return {
    cwd,
    kernelSpecName
  };
};

export const launchKernelWhenNotebookSetEpic = (
  action$: ActionsObservable<*>
) =>
  action$.pipe(
    ofType(actionTypes.SET_NOTEBOOK),
    map((action: SetNotebookAction) => {
      const { cwd, kernelSpecName } = extractNewKernel(
        action.filename,
        action.notebook
      );

      return actions.launchKernelByName(kernelSpecName, cwd);
    })
  );

export const restartKernelEpic = (action$: ActionsObservable<*>, store: *) =>
  action$.pipe(
    ofType(actionTypes.RESTART_KERNEL),
    concatMap(action => {
      const state = store.getState();
      const kernel = selectors.currentKernel(state);
      const notificationSystem = selectors.notificationSystem(state);

      if (!kernel) {
        notificationSystem.addNotification({
          title: "Failure to Restart",
          message: `Unable to restart kernel, please select a new kernel.`,
          dismissible: true,
          position: "tr",
          level: "error"
        });

        // TODO: Wow do we need to send notifcations through our store for
        // consistency
        return empty();
      }

      // TODO: Incorporate this into each of the launchKernelByName
      //       actions...
      //       This only mirrors the old behavior of restart kernel (for now)
      notificationSystem.addNotification({
        title: "Kernel Restarted",
        message: `Kernel ${kernel.kernelSpecName} has been restarted.`,
        dismissible: true,
        position: "tr",
        level: "success"
      });

      return of(
        actions.killKernel({ restarting: true }),
        actions.launchKernelByName(kernel.kernelSpecName, kernel.cwd)
      );
    })
  );
