/* @flow */

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

import {
  setNotebook,
  doneSaving,
  fetchContentFailed,
  fetchContentFulfilled
} from "../actions";

import { FETCH_CONTENT_FULFILLED } from "../actionTypes";

import type { ActionsObservable } from "redux-observable";

import { contents } from "rx-jupyter";

import { fromJS, toJS, stringifyNotebook } from "@nteract/commutable";

import { FETCH_CONTENT, SAVE } from "../actionTypes";
import type { FetchContent } from "../actionTypes";

export function fetchContentEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(FETCH_CONTENT),
    tap((action: FetchContent) => {
      if (!action.payload || !action.payload.path) {
        throw new Error("fetching content needs a path");
      }
    }),
    switchMap((action: FetchContent) => {
      // TODO: Use the selector from the kernelspecs work
      const host = store.getState().app.host;
      const serverConfig = {
        endpoint: host.serverUrl,
        token: host.token,
        crossDomain: host.crossDomain
      };

      return contents
        .get(serverConfig, action.payload.path, action.payload.params)
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map(xhr => {
            return fetchContentFulfilled({
              path: action.payload.path,
              model: xhr.response
            });
          }),
          catchError((xhrError: any) =>
            of(
              fetchContentFailed({ path: action.payload.path, error: xhrError })
            )
          )
        );
    })
  );
}

export function saveContentEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(SAVE),
    map(action => {
      const state = store.getState();
      const notebook = state.document.get("notebook");
      const filename = state.document.get("filename");

      const version = state.app.get("version", "0.0.0-beta");

      return {
        filename,
        // contents API takes notebook as raw JSON
        notebook: toJS(
          notebook.setIn(["metadata", "nteract", "version"], version)
        )
      };
    }),
    mergeMap(({ filename, notebook }) => {
      // TODO: Use the selector from the kernelspecs work
      const host = store.getState().app.host;
      const serverConfig = {
        endpoint: host.serverUrl,
        token: host.token,
        crossDomain: host.crossDomain
      };

      const model = {
        content: notebook,
        type: "notebook"
      };

      return contents.save(serverConfig, filename, model).pipe(
        mapTo(doneSaving()),
        catchError((error: Error) =>
          of({
            type: "ERROR",
            payload: error,
            error: true
          })
        )
      );
    })
  );
}

// When content gets loaded, if it's a notebook, set it up as the notebook
export function setNotebookEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(FETCH_CONTENT_FULFILLED),
    tap(action => {
      if (
        !action.payload ||
        !action.payload.model ||
        !action.payload.model.type
      ) {
        throw new Error("content needs a type");
      }
    }),
    filter(action => action.payload.model.type === "notebook"),
    map(action =>
      setNotebook(action.payload.path, fromJS(action.payload.model.content))
    ),
    catchError((xhrError: any) =>
      of({ type: "ERROR", payload: xhrError, error: true })
    )
  );
}
