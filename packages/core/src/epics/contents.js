/* @flow */
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import {
  tap,
  filter,
  map,
  mergeMap,
  mapTo,
  switchMap,
  catchError
} from "rxjs/operators";
import { ofType } from "redux-observable";

import FileSaver from "file-saver";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import * as selectors from "../selectors";

import type { ActionsObservable } from "redux-observable";

import { contents } from "rx-jupyter";

import { fromJS, toJS, stringifyNotebook } from "@nteract/commutable";

export function fetchContentEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(actionTypes.FETCH_CONTENT),
    switchMap((action: actionTypes.FetchContent) => {
      if (!action.payload || typeof action.payload.filepath !== "string") {
        return of({
          type: "ERROR",
          error: true,
          payload: { error: new Error("fetching content needs a payload") }
        });
      }

      const state = store.getState();

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      return contents
        .get(serverConfig, action.payload.filepath, action.payload.params)
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map(xhr => {
            return actions.fetchContentFulfilled({
              filepath: action.payload.filepath,
              model: xhr.response,
              kernelRef: action.payload.kernelRef,
              contentRef: action.payload.contentRef
            });
          }),
          catchError((xhrError: any) =>
            of(
              actions.fetchContentFailed({
                filepath: action.payload.filepath,
                error: xhrError,
                kernelRef: action.payload.kernelRef,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

export function downloadNotebook(notebook: Object, filepath: string) {
  const filename = (filepath || "notebook.ipynb").split("/").pop();
  const data = stringifyNotebook(notebook);
  const blob = new Blob([data], { type: "application/json" });
  // NOTE: There is no callback for this, we have to rely on the browser
  //       to do this well, so we assume it worked
  FileSaver.saveAs(blob, filename);
}

export function saveContentEpic(
  action$: ActionsObservable<Action>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(actionTypes.SAVE, actionTypes.DOWNLOAD_CONTENT),
    mergeMap(
      (
        action: actionTypes.Save | actionTypes.DownloadContent
      ): ActionsObservable<Action> => {
        const state = store.getState();

        const host = selectors.currentHost(state);
        if (host.type !== "jupyter") {
          // Dismiss any usage that isn't targeting a jupyter server
          return empty();
        }
        const contentRef = action.payload.contentRef;
        const content = selectors.content(state, { contentRef });
        // NOTE: This could save by having selectors for each model type
        //       have toDisk() selectors
        //       It will need to be cased off when we have more than one type
        //       of content we actually save
        if (
          !content ||
          content.type !== "notebook" ||
          !content.model.notebook
        ) {
          const errorPayload = {
            error: new Error("Notebook was not set."),
            contentRef: action.payload.contentRef
          };
          if (action.type === actionTypes.DownloadContent) {
            return of(actions.downloadContentFailed(errorPayload));
          }
          return of(actions.saveFailed(errorPayload));
        }

        const notebookModel = content.model.notebook;

        const filepath = content.filepath;
        // TODO: this default version should probably not be here.
        const appVersion = selectors.appVersion(state) || "0.0.0-beta";

        // contents API takes notebook as raw JSON whereas downloading takes
        // a string
        const notebook = toJS(
          notebookModel.setIn(["metadata", "nteract", "version"], appVersion)
        );

        if (action.type === actionTypes.DOWNLOAD_CONTENT) {
          downloadNotebook(notebook, filepath);
          return of(
            actions.downloadContentFulfilled({
              contentRef: action.payload.contentRef
            })
          );
        }

        const serverConfig = selectors.serverConfig(host);

        const model = {
          content: notebook,
          type: "notebook"
        };

        // if (action.type === actionTypes.SAVE)
        return contents.save(serverConfig, filepath, model).pipe(
          mapTo(
            actions.saveFulfilled({ contentRef: action.payload.contentRef })
          ),
          catchError((error: Error) =>
            of(
              actions.saveFailed({
                error,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
      }
    )
  );
}

// When content gets loaded, if it's a notebook, set it up as the notebook
export function setNotebookEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(actionTypes.FETCH_CONTENT_FULFILLED),
    tap((action: actionTypes.FetchContentFulfilled) => {
      if (
        !action.payload ||
        !action.payload.model ||
        !action.payload.model.type
      ) {
        throw new Error("content needs a type");
      }
    }),
    filter(
      (action: actionTypes.FetchContentFulfilled) =>
        action.payload.model.type === "notebook"
    ),
    map((action: actionTypes.FetchContentFulfilled) =>
      actions.setNotebook({
        filepath: action.payload.filepath,
        notebook: fromJS(action.payload.model.content),
        kernelRef: action.payload.kernelRef,
        contentRef: action.payload.contentRef,
        lastSaved: action.payload.model.last_modified,
        created: action.payload.model.created
      })
    ),
    catchError((xhrError: any) =>
      // TODO: We should create an actionType/action for this to make it easier
      // for reducers to target.
      of({ type: "ERROR", payload: xhrError, error: true })
    )
  );
}
