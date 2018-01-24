import {
  makeCommunicationKernelspecs,
  makeKernelspec
} from "@nteract/types/core/records";
import * as actionTypes from "../actionTypes";
import createImmutableMapReducer from "./createImmutableMapReducer";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

import type { KernelspecProps } from "@nteract/types/core/records";

// Communication state.
const communicationKernelspecsLoading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
      return true;
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return false;
    default:
      return state;
  }
};
const communicationKernelspecsError = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return null;
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return action.payload.error;
    default:
      return state;
  }
};
const communicationKernelspecs = combineReducers(
  {
    loading: communicationKernelspecsLoading,
    error: communicationKernelspecsError
  },
  makeCommunicationKernelspecs
);
export const communicationKernelspecsByRef = createImmutableMapReducer(
  action => action.kernelspecsRef,
  communicationKernelspecs
);

// Entities state.
const entitiesKernelspecs = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return Immutable.Map(action.payload.kernelspecs).map(
        (kernelspec: KernelspecProps) => makeKernelspec(kernelspec)
      );
    default:
      return state;
  }
};
export const entitiesKernelspecsByRef = createImmutableMapReducer(
  action => action.payload && action.payload.kernelspecsRef,
  entitiesKernelspecs
);
