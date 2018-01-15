// @flow
import { catchError } from "rxjs/operators";
import { saveEpic, saveAsEpic } from "./saving";

import { loadEpic, newNotebookEpic } from "./loading";

import type { ActionsObservable, Epic } from "redux-observable";

import {
  launchKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  launchKernelByNameEpic
} from "./kernel-launch";

import {
  executeCellEpic,
  updateDisplayEpic,
  commListenEpic
} from "@nteract/core/epics";

import { publishEpic } from "./github-publish";

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
} from "./config";

export function retryAndEmitError(err: Error, source: ActionsObservable<*>) {
  return source.startWith({ type: "ERROR", payload: err, error: true });
}

export const wrapEpic = (epic: Epic<*, *, *>) => (...args: any) =>
  epic(...args).pipe(catchError(retryAndEmitError));

const epics = [
  commListenEpic,
  publishEpic,
  saveEpic,
  saveAsEpic,
  loadEpic,
  newNotebookEpic,
  executeCellEpic,
  updateDisplayEpic,
  launchKernelEpic,
  launchKernelByNameEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
].map(wrapEpic);

export default epics;
