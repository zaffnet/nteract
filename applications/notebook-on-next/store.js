/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { Map as ImmutableMap } from "immutable";

import { reducers, state, epics as coreEpics } from "@nteract/core";

// TODO: Bring desktop's wrapEpic over to @nteract/core so we can use it here
const epics = coreEpics.allEpics;

const rootReducer = combineReducers({
  app: reducers.app,
  document: reducers.document,
  comms: reducers.comms,
  config: reducers.config
});

const defaultState = {
  app: state.makeAppRecord(),
  document: state.makeDocumentRecord(),
  comms: state.makeCommsRecord(),
  config: ImmutableMap({
    theme: "light"
  }),
  // TODO FIXME FIXME FIXME
  core: ImmutableMap(),
  modals: ImmutableMap()
};

const composeEnhancers =
  (typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

export default function configureStore() {
  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    // $FlowFixMe
    rootReducer,
    defaultState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
