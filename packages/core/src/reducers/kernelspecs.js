// @flow
import {
  makeCommunicationKernelspecs,
  makeKernelspec
} from "@nteract/types/core/records";
import * as actionTypes from "../actionTypes";
import * as Immutable from "immutable";

import type { KernelspecProps } from "@nteract/types/core/records";

export const communicationKernelspecsByRef = (
  state = Immutable.Map(),
  action: *
) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
      return state.set(
        action.payload.kernelspecsRef,
        makeCommunicationKernelspecs({ loading: true, error: null })
      );
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return state.set(
        action.payload.kernelspecsRef,
        makeCommunicationKernelspecs({ loading: false, error: null })
      );
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return state.set(
        action.payload.kernelspecsRef,
        makeCommunicationKernelspecs({
          loading: false,
          error: action.payload.error
        })
      );
    default:
      return state;
  }
};

export const entitiesKernelspecsByRef = (
  state = Immutable.Map(),
  action: *
) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return state.set(
        action.payload.kernelspecsRef,
        Immutable.Map(action.payload.kernelspecs).map(
          (kernelspec: KernelspecProps) => makeKernelspec(kernelspec)
        )
      );
    default:
      return state;
  }
};
