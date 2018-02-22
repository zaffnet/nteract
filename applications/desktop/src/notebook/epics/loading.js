/* @flow */

import * as path from "path";
import * as fs from "fs";

import { of } from "rxjs/observable/of";
import { forkJoin } from "rxjs/observable/forkJoin";
import {
  map,
  tap,
  mergeMap,
  switchMap,
  catchError,
  timeout
} from "rxjs/operators";

import { ActionsObservable, ofType } from "redux-observable";

import { readFileObservable, statObservable } from "fs-observable";

import * as Immutable from "immutable";
import { monocellNotebook, fromJS, parseNotebook } from "@nteract/commutable";
import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

import { actionTypes, actions } from "@nteract/core";

import type { SetNotebookAction } from "@nteract/core/src/actionTypes";

/**
 * Determines the right kernel to launch based on a notebook
 */
export const extractNewKernel = (
  filename?: string,
  notebook: ImmutableNotebook
) => {
  // TODO: There's some incongruence between desktop and web app here, regarding path vs. filename
  //       Instead, this function is slightly repeated between here and @nteract/core
  const cwd =
    (filename && path.dirname(path.resolve(filename))) || process.cwd();
  const kernelSpecName = notebook.getIn(
    ["metadata", "kernelspec", "name"],
    notebook.getIn(["metadata", "language_info", "name"], "python3")
  );
  return {
    cwd,
    kernelSpecName
  };
};

function createContentsResponse(
  filePath: string,
  stat: fs.Stats,
  content: *
): JupyterApi$Content {
  const parsedFilePath = path.parse(filePath);

  const name = parsedFilePath.base;
  const writable = Boolean(fs.constants.W_OK & stat.mode);
  const created = stat.birthtime;
  const last_modified = stat.mtime;

  if (stat.isDirectory()) {
    return {
      type: "directory",
      mimetype: null,
      format: "json",
      content,
      writable: true,
      name: name === "." ? "" : name,
      path: filePath === "." ? "" : filePath,
      created,
      last_modified
    };
  } else if (stat.isFile()) {
    if (parsedFilePath.ext === ".ipynb") {
      return {
        type: "notebook",
        mimetype: null,
        format: "json",
        content: content ? JSON.parse(content) : null,
        writable: true,
        name,
        path: filePath,
        created,
        last_modified
      };
    }

    // TODO: Mimetype detection
    return {
      type: "file",
      mimetype: null,
      format: "text",
      content,
      writable: true,
      name,
      path: filePath,
      created,
      last_modified
    };
  }

  throw new Error(`Unsupported filetype at ${filePath}`);
}

/**
 * Loads a notebook and launches its kernel.
 *
 * @param  {ActionObservable}  A LOAD action with the notebook filename
 */
export const fetchContentEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.FETCH_CONTENT),
    tap(action => {
      // If there isn't a filename, save-as it instead
      if (!action.payload.path) {
        throw new Error("fetch content needs a path");
      }
    }),
    // Switch map since we want the last load request to be the lead
    switchMap(action => {
      const filepath = action.payload.path;

      return forkJoin(
        readFileObservable(filepath),
        statObservable(filepath),
        // Project onto the Contents API response
        (content, stat) => createContentsResponse(filepath, stat, content)
      ).pipe(
        // Timeout after one minute
        timeout(60 * 1000),
        map(model =>
          actions.fetchContentFulfilled({
            path: model.path,
            model
          })
        ),
        catchError((err: Error) =>
          of(actions.fetchContentFailed({ path: filepath, error: err }))
        )
      );
    })
  );

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

/**
 * Sets a new empty notebook.
 *
 * @param  {ActionObservable}  ActionObservable for NEW_NOTEBOOK action
 */
export const newNotebookEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.NEW_NOTEBOOK),
    map(action => {
      const { name, spec } = action.kernelSpec;

      let notebook = monocellNotebook;

      if (name) {
        notebook = notebook.setIn(["metadata", "kernel_info", "name"], name);
      }

      if (spec) {
        notebook = notebook.setIn(["metadata", "kernelspec"], spec);
      }

      return actions.setNotebook(null, notebook);
    })
  );
