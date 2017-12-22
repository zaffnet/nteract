import { applyMiddleware, createStore } from "redux";
import { combineReducers, compose } from "redux";
import { createEpicMiddleware } from "redux-observable";
import epics from "./epics";
import reducer from "./reducer";
import getInitialState from "./getInitialState";
import merge from "deepmerge";

export default function(givenInitialState = {}) {
  const initialState = merge(getInitialState(), givenInitialState);
  const epicMiddleware = createEpicMiddleware(epics);
  const composeEnhancers =
    (typeof window !== "undefined" &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  return createStore(
    reducer,
    initialState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
}
