/* @flow */
import { createStore, applyMiddleware, combineReducers } from "redux";

import type { AppState } from "@nteract/core/src/state";

import middlewares from "./middlewares";

import { reducers } from "@nteract/core";

const rootReducer = combineReducers({
  app: reducers.app,
  document: reducers.document,
  comms: reducers.comms,
  config: reducers.config,
  modals: reducers.modals,
  core: reducers.core
});

export default function configureStore(initialState: AppState) {
  // $FlowFixMe: Not sure why this is failing now?
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
