/* @flow */
import { createStore, applyMiddleware, combineReducers } from "redux";

import type { AppState } from "@nteract/core/src/records";

import middlewares from "./middlewares";

import { document, comms, config, app } from "@nteract/core/reducers";

const rootReducer = combineReducers({
  app,
  document,
  comms,
  config
});

export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
