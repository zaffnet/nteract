/* @flow */

import {
  ActionsObservable,
  ofType
} from "redux-observable"; /* eslint-disable no-unused-vars */
import { writeFileObservable } from "fs-observable";
import { SAVE, SAVE_AS } from "@nteract/core/actionTypes";
import * as selectors from "@nteract/core/selectors";

import { changeFilename, save, doneSaving } from "@nteract/core/actions";

import { toJS, stringifyNotebook } from "@nteract/commutable";

import { of } from "rxjs/observable/of";
import { tap, mergeMap, catchError, map } from "rxjs/operators";

/**
 * Cleans up the notebook document and saves the file.
 *
 * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
 */
export function saveEpic(
  action$: ActionsObservable<*>,
  store: Store<any, any>
) {
  return action$.pipe(
    ofType(SAVE),
    mergeMap(action => {
      const state = store.getState();
      const currentNotebook = selectors.currentNotebook(state);
      const filename = selectors.currentFilename(state);
      // TODO: this default version should probably not be here.
      const appVersion = selectors.appVersion(state) || "0.0.0-beta";
      const notebook = stringifyNotebook(
        toJS(
          currentNotebook.setIn(["metadata", "nteract", "version"], appVersion)
        )
      );
      return writeFileObservable(filename, notebook).pipe(
        map(() => {
          if (process.platform !== "darwin") {
            const state = store.getState();
            const notificationSystem = state.app.get("notificationSystem");
            notificationSystem.addNotification({
              title: "Save successful!",
              autoDismiss: 2,
              level: "success"
            });
          }
          return doneSaving();
        }),
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

/**
 * Sets the filename for a notebook before saving.
 *
 * @param  {ActionObservable}  action$ The SAVE_AS action with the filename and notebook
 */
export function saveAsEpic(action$: ActionsObservable<*>) {
  return action$.pipe(
    ofType(SAVE_AS),
    mergeMap(action => {
      return [
        // order matters here, since we need the filename set in the state
        // before we save the document
        changeFilename(action.filename),
        save()
      ];
    })
  );
}
