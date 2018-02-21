/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import {
  document,
  comms,
  config,
  app,
  modals,
  core
} from "@nteract/core/reducers";

import {
  makeAppRecord,
  makeDocumentRecord,
  makeCommsRecord,
  makeJupyterHostRecord
} from "@nteract/core/records";

import type { AppState } from "@nteract/core/src/records";

import { allEpics as epics } from "@nteract/core/epics";

export type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string
};

const rootReducer = combineReducers({
  app,
  document,
  comms,
  config,
  modals,
  core
});

export default function configureStore({
  config
}: {
  config: JupyterConfigData
}) {
  const initialState = {
    app: makeAppRecord({
      host: makeJupyterHostRecord({
        token: config.token,
        // TODO: Use URL join, even though we know these are right
        serverUrl: location.origin + config.baseUrl
      }),
      version: `nteract-on-jupyter@${config.appVersion}`
    }),
    document: makeDocumentRecord(),
    comms: makeCommsRecord(),
    config: ImmutableMap({
      theme: "light"
    })
  };

  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
