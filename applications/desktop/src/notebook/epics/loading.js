/* @flow */

import * as path from "path";
import * as fs from "fs";

import { of } from "rxjs/observable/of";
import { forkJoin } from "rxjs/observable/forkJoin";
import { map, tap, mergeMap, switchMap, catchError } from "rxjs/operators";

import { ActionsObservable, ofType } from "redux-observable";

import { readFileObservable, statObservable } from "fs-observable";

import { monocellNotebook, fromJS, parseNotebook } from "@nteract/commutable";
import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

import * as actionTypes from "@nteract/core/actionTypes";
import * as actions from "@nteract/core/actions";

/**
 * Creates a new kernel based on the language info in the notebook.
 *
 * @param  {String}  filename  The filename of the notebook being loaded
 * @param  {Immutable<Map>}  notebook  The notebook to extract langauge info from
 *
 * @returns  {ActionObservable}  ActionObservable for a LAUNCH_KERNEL_SUCCESSFUL action
 */
export const extractNewKernel = (
  filename: string,
  notebook: ImmutableNotebook
) => {
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

/**
 * Converts a notebook from JSON to an Immutable.Map.
 *
 * @param  {String}  filename The filename of the notebook to convert
 * @param  {String}  data  The raw JSON of the notebook
 *
 * @returns  {Object}  The filename and notebook in Immutable.Map form
 */
export const convertRawNotebook = (filename: string, data: string) => ({
  filename,
  notebook: fromJS(parseNotebook(data))
});

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
        content,
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
export const loadEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LOAD),
    tap(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error("load needs a filename");
      }
    }),
    // Switch map since we want the last load request to be the lead
    switchMap(action => {
      const filepath = action.filename;

      return forkJoin(
        readFileObservable(filepath),
        statObservable(filepath),
        // Project onto the Contents API response
        (content, stat) => createContentsResponse(filepath, stat, content)
      ).pipe(
        // TODO: Switch this all to a response to fetchContents instead
        //       and handle accordingly
        map(({ content, path }) => convertRawNotebook(path, content)),
        mergeMap(({ filename, notebook }) => {
          const { cwd, kernelSpecName } = extractNewKernel(filename, notebook);
          return of(
            actions.setNotebook(filename, notebook),
            // Find kernel based on kernel name
            // NOTE: Conda based kernels and remote kernels will need
            // special handling
            actions.launchKernelByName(kernelSpecName, cwd)
          );
        }),
        catchError(err => of({ type: "ERROR", payload: err, error: true }))
      );
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
    switchMap(action =>
      of(
        // TODO: Switch filename to an optional argument
        actions.setNotebook(null, monocellNotebook),
        actions.launchKernel(action.kernelSpec, action.cwd)
      )
    )
  );
