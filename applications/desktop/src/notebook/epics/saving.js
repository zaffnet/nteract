/* @flow */
import type { Save, SaveAs } from "@nteract/core/src/actionTypes";

import {
  ActionsObservable,
  ofType
} from "redux-observable"; /* eslint-disable no-unused-vars */
import { writeFileObservable } from "fs-observable";

import { actionTypes, selectors, actions } from "@nteract/core";

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
    ofType(actionTypes.SAVE),
    mergeMap((action: Save) => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;

      const model = selectors.model(state, { contentRef });

      if (!model || model.type !== "notebook") {
        return of(
          actions.saveFailed({
            error: new Error("no notebook loaded to save"),
            contentRef: action.payload.contentRef
          })
        );
      }

      const filepath = selectors.currentFilepath(state);
      // TODO: this default version should probably not be here.
      const appVersion = selectors.appVersion(state) || "0.0.0-beta";
      const notebook = stringifyNotebook(
        toJS(
          model.notebook.setIn(["metadata", "nteract", "version"], appVersion)
        )
      );
      return writeFileObservable(filepath, notebook).pipe(
        map(() => {
          if (process.platform !== "darwin") {
            const state = store.getState();
            const notificationSystem = selectors.notificationSystem(state);
            notificationSystem.addNotification({
              title: "Save successful!",
              autoDismiss: 2,
              level: "success"
            });
          }
          return actions.saveFulfilled({
            contentRef: action.payload.contentRef
          });
        }),
        catchError((error: Error) =>
          of(
            actions.saveFailed({
              error,
              contentRef: action.payload.contentRef
            })
          )
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
    ofType(actionTypes.SAVE_AS),
    mergeMap((action: SaveAs) => {
      return [
        // order matters here, since we need the filename set in the state
        // before we save the document
        actions.changeFilename({
          filepath: action.payload.filepath,
          contentRef: action.payload.contentRef
        }),
        actions.save({
          contentRef: action.payload.contentRef
        })
      ];
    })
  );
}
