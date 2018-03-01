// @flow
import * as actionTypes from "../../actionTypes";
import { combineReducers } from "redux-immutable";
import { communication } from "./communication";
import { entities } from "./entities";
import { makeStateRecord } from "../../state";

// TODO: this is temporary until we fully move over to the new core state.
const useCore = (state = false, action) => {
  switch (action.type) {
    case actionTypes.USE_CORE:
      return true;
    default:
      return state;
  }
};

// TODO: This is temporary until we have sessions in place. Ideally, we point to
// a document, which knows about its session and that session knows about its
// kernel. For now, we need to keep a reference to the currently targeted kernel
// around.
const kernelRef = (state = null, action) => {
  switch (action.type) {
    case actionTypes.LAUNCH_KERNEL:
    case actionTypes.LAUNCH_KERNEL_BY_NAME:
      return action.payload.selectNextKernel ? action.payload.ref : state;
    default:
      return state;
  }
};

const core = combineReducers(
  {
    useCore,
    communication,
    entities,
    kernelRef
  },
  makeStateRecord
);

export default core;
