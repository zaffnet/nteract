// @flow
import { remote } from "electron";

import {
  MERGE_CONFIG,
  SET_CONFIG_AT_KEY,
  DONE_SAVING_CONFIG,
  LOAD_CONFIG,
  SAVE_CONFIG
} from "@nteract/core/actionTypes";

import { readFileObservable, writeFileObservable } from "fs-observable";
import { mapTo, mergeMap, map, switchMap } from "rxjs/operators";
import { ofType } from "redux-observable";

import type { ActionsObservable } from "redux-observable";

const path = require("path");

export const loadConfig = () => ({ type: LOAD_CONFIG });
export const saveConfig = () => ({ type: SAVE_CONFIG });
export const doneSavingConfig = () => ({ type: DONE_SAVING_CONFIG });

export const configLoaded = (config: any) => ({
  type: MERGE_CONFIG,
  config
});

const HOME = remote.app.getPath("home");

export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

/**
 * An epic that loads the configuration.
 *
 * @param  {ActionObservable}  actions ActionObservable for LOAD_CONFIG action
 * @return {ActionObservable}  ActionObservable for MERGE_CONFIG action
 */
export const loadConfigEpic = (actions: ActionsObservable<*>) =>
  actions.pipe(
    ofType(LOAD_CONFIG),
    switchMap(() =>
      readFileObservable(CONFIG_FILE_PATH).pipe(
        map(JSON.parse),
        map(configLoaded)
      )
    )
  );

/**
 * An epic that saves the configuration if it has been changed.
 *
 * @param  {ActionObservable}  actions ActionObservable for SET_CONFIG_AT_KEY action
 * @return {ActionObservable}  ActionObservable with SAVE_CONFIG type
 */
export const saveConfigOnChangeEpic = (actions: ActionsObservable<*>) =>
  actions.pipe(ofType(SET_CONFIG_AT_KEY), mapTo({ type: SAVE_CONFIG }));

/**
 * An epic that saves the configuration.
 *
 * @param  {ActionObservable}  actions ActionObservable containing SAVE_CONFIG action
 * @return {ActionObservable}  ActionObservable for DONE_SAVING action
 */
export const saveConfigEpic = (actions: ActionsObservable<*>, store: any) =>
  actions.pipe(
    ofType(SAVE_CONFIG),
    mergeMap(() =>
      writeFileObservable(
        CONFIG_FILE_PATH,
        JSON.stringify(store.getState().config.toJS())
      ).pipe(map(doneSavingConfig))
    )
  );
