/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { Map as ImmutableMap } from "immutable";

import { app, document, comms, config } from "@nteract/core/reducers";

import type { AppState } from "@nteract/types/core/records";

import {
  makeAppRecord,
  makeDocumentRecord,
  AppRecord,
  DocumentRecord,
  CommsRecord
} from "@nteract/types/core/records";

import {
  executeCellEpic,
  updateDisplayEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic
} from "@nteract/core/epics";

// TODO: Bring desktop's wrapEpic over to @nteract/core so we can use it here
const epics = [
  executeCellEpic,
  updateDisplayEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic
];

const rootReducer = combineReducers({
  app,
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
  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    defaultState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
