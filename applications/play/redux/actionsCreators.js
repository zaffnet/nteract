import * as actionTypes from "./actionTypes";

export const setServer = payload => ({
  type: actionTypes.SET_SERVER,
  payload
});

export const fetchServer = payload => ({
  type: actionTypes.FETCH_SERVER,
  payload
});
export const fetchServerFulfilled = payload => ({
  type: actionTypes.FETCH_SERVER_FULFILLED,
  payload
});
export const fetchServerFailed = payload => ({
  type: actionTypes.FETCH_SERVER_FAILED,
  payload
});
export const fetchServerCanceled = payload => ({
  type: actionTypes.FETCH_SERVER_CANCELED,
  payload
});

export const killServer = payload => ({
  type: actionTypes.KILL_SERVER,
  payload
});
export const killServerFulfilled = payload => ({
  type: actionTypes.KILL_SERVER_FULFILLED,
  payload
});
export const killServerFailed = payload => ({
  type: actionTypes.KILL_SERVER_FAILED,
  payload
});
export const killServerCanceled = payload => ({
  type: actionTypes.KILL_SERVER_CANCELED,
  payload
});

export const fetchKernelSpecs = payload => ({
  type: actionTypes.FETCH_KERNEL_SPECS,
  payload
});
export const fetchKernelSpecsFulfilled = payload => ({
  type: actionTypes.FETCH_KERNEL_SPECS_FULFILLED,
  payload
});
export const fetchKernelSpecsFailed = payload => ({
  type: actionTypes.FETCH_KERNEL_SPECS_FAILED,
  payload
});
export const fetchKernelSpecsCanceled = payload => ({
  type: actionTypes.FETCH_KERNEL_SPECS_CANCELED,
  payload
});

export const setActiveKernel = payload => ({
  type: actionTypes.SET_ACTIVE_KERNEL,
  payload
});
export const restartKernel = payload => ({
  type: actionTypes.RESTART_KERNEL,
  payload
});

export const activateKernel = payload => ({
  type: actionTypes.ACTIVATE_KERNEL,
  payload
});
export const activateKernelFulfilled = payload => ({
  type: actionTypes.ACTIVATE_KERNEL_FULFILLED,
  payload
});
export const activatedKernelFailed = payload => ({
  type: actionTypes.ACTIVATE_KERNEL_FAILED,
  payload
});
export const activateKernelCanceled = payload => ({
  type: actionTypes.ACTIVATE_KERNEL_CANCELED,
  payload
});

export const interruptKernel = payload => ({
  type: actionTypes.INTERRUPT_KERNEL,
  payload
});
export const interruptKernelFulfilled = payload => ({
  type: actionTypes.INTERRUPT_KERNEL_FULFILLED,
  payload
});
export const interruptKernelFailed = payload => ({
  type: actionTypes.INTERRUPT_KERNEL_FAILED,
  payload
});
export const interruptKernelCanceled = payload => ({
  type: actionTypes.INTERRUPT_KERNEL_CANCELED,
  payload
});

export const killKernel = payload => ({
  type: actionTypes.KILL_KERNEL,
  payload
});
export const killKernelFulfilled = payload => ({
  type: actionTypes.KILL_KERNEL_FULFILLED,
  payload
});
export const killKernelFailed = payload => ({
  type: actionTypes.KILL_KERNEL_FAILED,
  payload
});
export const killKernelCanceled = payload => ({
  type: actionTypes.KILL_KERNEL_CANCELED,
  payload
});

export const submitBinderForm = payload => ({
  type: actionTypes.SUBMIT_BINDER_FORM,
  payload
});

export const setSource = payload => ({
  type: actionTypes.SET_SOURCE,
  payload
});

export const setShowPanel = payload => ({
  type: actionTypes.SET_SHOW_PANEL,
  payload
});

export const setServerId = payload => ({
  type: actionTypes.SET_SERVER_ID,
  payload
});

export const setCurrentKernelName = payload => ({
  type: actionTypes.SET_CURRENT_KERNEL_NAME,
  payload
});
