/* @flow */

import {
  ActionsObservable,
  ofType
} from "redux-observable"; /* eslint-disable no-unused-vars */
import { writeFileObservable } from "fs-observable";
import { SAVE, SAVE_AS } from "@nteract/core/actionTypes";

import { changeFilename, save, doneSaving } from "@nteract/core/actions";

import { toJS, stringifyNotebook } from "@nteract/commutable";

import { remote } from "electron";

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
    map(action => {
      const state = store.getState();
      const notebook = state.document.get("notebook");
      const filename = state.document.get("filename");

      return {
        notebook,
        filename
      };
    }),
    mergeMap(action =>
      writeFileObservable(
        action.filename,
        stringifyNotebook(
          toJS(
            action.notebook.setIn(
              ["metadata", "nteract", "version"],
              remote.app.getVersion()
            )
          )
        )
      ).pipe(
        catchError((error: Error) =>
          of({
            type: "ERROR",
            payload: error,
            error: true
          })
        ),
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
          return doneSaving(action.notebook);
        })
      )
    )
  );
}

/**
 * Sets the filename for a notebook before saving.
 *
 * @param  {ActionObservable}  action$ The SAVE_AS action with the filename and notebook
 */
export function saveAsEpic(
  action$: ActionsObservable<*>,
  store: Store<any, any>
) {
  return action$.pipe(
    ofType(SAVE_AS),
    mergeMap(action => {
      const state = store.getState();
      const notebook = state.document.get("notebook");

      return [
        // order matters here, since we need the filename set in the state
        // before we save the document
        changeFilename(action.filename),
        save()
      ];
    })
  );
}
