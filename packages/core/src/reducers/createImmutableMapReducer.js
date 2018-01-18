// @flow
import { Map } from "immutable";

type GetKeyType = (action: Object) => string | void;
type ReducerType = (state: *, action: Object) => *;

/**
 * Similar to how combineReducers allows you to create a container reducer to
 * delegate actions where each key maps to a reducer to handle the key's value--
 * createObjectReducer allows you to create a container reducer to delegate
 * actions where *all* keys use the *same* reducer, but the keys are not known
 * ahead of time.
 */
const createImmutableMapReducer = (
  getKey: GetKeyType,
  reducer: ReducerType
) => (state: * = Map({}), action: *) => {
  const key = getKey(action);
  if (typeof key !== "undefined") {
    const previousValueState = state.get(key);
    const nextValueState = reducer(previousValueState, action);
    // Don't return a new object if nothing changed.
    if (nextValueState !== previousValueState) {
      return state.set(key, nextValueState);
    }
  }
  return state;
};

export default createImmutableMapReducer;
