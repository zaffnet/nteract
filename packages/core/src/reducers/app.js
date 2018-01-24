// @flow
import {
  makeAppRecord,
  makeLocalKernelRecord,
  makeRemoteKernelRecord,
  makeDesktopHostRecord,
  makeJupyterHostRecord,
  AppRecord
} from "@nteract/types/core/records";

import * as actionTypes from "../actionTypes";

import type { NewKernelAction, SetExecutionStateAction } from "../actionTypes";

export function launchKernelSuccessful(
  state: AppRecord,
  action: NewKernelAction
) {
  if (!action.kernel || !action.kernel.type) {
    // unset on lack of kernel
    return state.set("kernel", null);
  }

  let kernel;

  // We create a record based on the kernel type
  switch (action.kernel.type) {
    case "websocket":
      kernel = makeRemoteKernelRecord(action.kernel);
      break;
    case "zeromq":
      kernel = makeLocalKernelRecord(action.kernel);
    default:
      kernel = null;
  }

  // TODO: implement cleanup kernel within an epic
  //       our old practice was to do the cleanup in the reducer which is an
  //       anti-pattern, _especially_ because it's really something that's async
  return state.set("kernel", kernel);
}

export function setExecutionState(
  state: AppRecord,
  action: SetExecutionStateAction
) {
  return state.setIn(["kernel", "status"], action.kernelStatus);
}

export default function handleApp(
  state: AppRecord = makeAppRecord(),
  action: *
) {
  switch (action.type) {
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      return launchKernelSuccessful(state, action);
    case actionTypes.SET_EXECUTION_STATE:
      return setExecutionState(state, action);
    default:
      return state;
  }
}
