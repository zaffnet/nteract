/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { Map as ImmutableMap } from "immutable";

import { reducers } from "@nteract/core";

import {
  makeAppRecord,
  makeDocumentRecord,
  makeCommsRecord
} from "@nteract/core/records";

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
  app: reducers.app,
  document: reducers.document,
  comms: reducers.comms,
  config: reducers.config
});

const defaultState = {
  app: makeAppRecord(),
  document: makeDocumentRecord(),
  comms: makeCommsRecord(),
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
