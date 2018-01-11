/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { Map as ImmutableMap } from "immutable";

import { document, comms, config } from "@nteract/core/reducers";
import { emptyNotebook, fromJS } from "@nteract/commutable";

import type { AppState } from "@nteract/types/core/records";

import {
  makeAppRecord,
  makeDocumentRecord,
  AppRecord,
  DocumentRecord,
  CommsRecord
} from "@nteract/types/core/records";

const rootReducer = combineReducers({
  app: (state = {}) => state,
  document,
  comms,
  config
});

const defaultState = {
  app: makeAppRecord(),
  document: makeDocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: "light"
  })
};

const composeEnhancers =
  (typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

export default function configureStore() {
  const rootEpic = combineEpics(...[]);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    defaultState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
