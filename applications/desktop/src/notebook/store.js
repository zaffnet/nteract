/* @flow */
import { createStore, applyMiddleware, combineReducers } from "redux";

import type { AppState } from "@nteract/core/src/state";

import middlewares from "./middlewares";

import { reducers, state as stateModule } from "@nteract/core";

const rootReducer = combineReducers({
  app: reducers.app,
  comms: reducers.comms,
  config: reducers.config,
  core: reducers.core
});

export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
