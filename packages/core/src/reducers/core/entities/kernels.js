// @flow
import {
  makeLocalKernelRecord,
  makeRemoteKernelRecord,
  makeKernelsRecord
} from "../../../state/entities/kernels";
import * as actionTypes from "../../../actionTypes";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

// TODO: we need to clean up references to old kernels at some point. Listening
// for KILL_KERNEL_SUCCESSFUL seems like a good candidate, but I think you can
// also end up with a dead kernel if that fails and you hit KILL_KERNEL_FAILED.
const byRef = (
  state = Immutable.Map(),
  action:
    | actionTypes.SetLanguageInfo
    | actionTypes.RestartKernel
    | actionTypes.KillKernelSuccessful
    | actionTypes.KillKernelFailed
    | actionTypes.NewKernelAction
    | actionTypes.LaunchKernelAction
    | actionTypes.LaunchKernelByNameAction
    | actionTypes.ChangeKernelByName
    | actionTypes.SetExecutionStateAction
) => {
  switch (action.type) {
    case actionTypes.SET_LANGUAGE_INFO:
      // TODO: Should the kernel hold language info?
      return state;
    case actionTypes.KILL_KERNEL_SUCCESSFUL:
      return state.setIn([action.payload.kernelRef, "status"], "killed");
    case actionTypes.KILL_KERNEL_FAILED:
      return state.setIn(
        [action.payload.kernelRef, "status"],
        "failed to kill"
      );
    case actionTypes.RESTART_KERNEL:
      return state.setIn([action.payload.kernelRef, "status"], "restarting");
    case actionTypes.LAUNCH_KERNEL:
    case actionTypes.LAUNCH_KERNEL_BY_NAME:
      return state.setIn([action.payload.kernelRef, "status"], "launching");
    case actionTypes.CHANGE_KERNEL_BY_NAME:
      return state.setIn([action.payload.oldKernelRef, "status"], "changing");
    case actionTypes.SET_EXECUTION_STATE:
      return state.setIn(
        [action.payload.kernelRef, "status"],
        action.payload.kernelStatus
      );
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      switch (action.payload.kernel.type) {
        case "zeromq":
          return state.set(
            action.payload.kernelRef,
            makeLocalKernelRecord(action.payload.kernel)
          );
        case "websocket":
          return state.set(
            action.payload.kernelRef,
            makeRemoteKernelRecord(action.payload.kernel)
          );
        default:
          throw new Error(
            `Unrecognized kernel type "${action.payload.kernel.type}".`
          );
      }
    default:
      return state;
  }
};

export const kernels = combineReducers({ byRef }, makeKernelsRecord);
