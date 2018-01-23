/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import { document, comms, config } from "@nteract/core/reducers";

import {
  makeAppRecord,
  AppRecord,
  makeDocumentRecord,
  DocumentRecord,
  CommsRecord,
  makeJupyterHostRecord
} from "@nteract/types/core/records";

import epics from "./epics";

export type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string
};

const webAppReducer = (state = {}, action) => {
  switch (action.type) {
    case "LOADED":
      return Object.assign({}, state, { contents: action.payload });
    case "KERNELSPECS_LISTED":
      return Object.assign({}, state, { kernelspecs: action.payload });
  }
  return state;
};

export type AppState = {
  app: AppRecord,
  document: DocumentRecord,
  comms: CommsRecord,
  config: ImmutableMap<string, any>,
  contents: any
};

const rootReducer = combineReducers({
  webApp: webAppReducer,
  app: (state = {}) => state,
  document,
  comms,
  config
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
      })
    }),
    document: makeDocumentRecord(),
    comms: CommsRecord(),
    config: ImmutableMap({
      theme: "light"
    }),
    webApp: { config }
  };

  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    // $FlowFixMe: Types incompatible, we've got to align what our app stores will be like
    rootReducer,
    // $FlowFixMe: Types incompatible, we've got to align what our app stores will be like
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
