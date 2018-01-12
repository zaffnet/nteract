/* @flow */
import { createStore, applyMiddleware } from "redux";

import type { AppState } from "@nteract/types/core/records";

import middlewares from "./middlewares";
import rootReducer from "./reducers";

export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
