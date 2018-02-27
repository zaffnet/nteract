/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import { reducers, state, epics as coreEpics } from "@nteract/core";

export type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string
};

const rootReducer = combineReducers({
  app: reducers.app,
  document: reducers.document,
  comms: reducers.comms,
  config: reducers.config,
  modals: reducers.modals,
  core: reducers.core
});

export default function configureStore({
  config
}: {
  config: JupyterConfigData
}) {
  const initialState = {
    // $FlowFixMe
    app: state.makeAppRecord({
      host: state.makeOldJupyterHostRecord({
        token: config.token,
        // TODO: Use URL join, even though we know these are right
        serverUrl: location.origin + config.baseUrl
      }),
      version: `nteract-on-jupyter@${config.appVersion}`
    }),
    document: state.makeDocumentRecord(),
    comms: state.makeCommsRecord(),
    config: ImmutableMap({
      theme: "light"
    }),
    // FIXME FIXME FIXME FIXME
    core: ImmutableMap(),
    modals: ImmutableMap()
  };

  const rootEpic = combineEpics(...coreEpics.allEpics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    // $FlowFixMe
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
