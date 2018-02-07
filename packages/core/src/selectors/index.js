// @flow
import type { AppState } from "@nteract/types/core/records";

import { createSelector } from "reselect";

const serverUrl = (state: AppState) => state.app.host.serverUrl;
const crossDomain = (state: AppState) => state.app.host.crossDomain;
const token = (state: AppState) => state.app.host.token;

export const getServerConfig = createSelector(
  [serverUrl, crossDomain, token],
  (serverUrl, crossDomain, token) => ({
    endpoint: serverUrl,
    crossDomain,
    token
  })
);

// Quick memoized host and kernel selection.
//
// Intended to be useful for a core app and be future proof for when we have
// both refs and selected/current hosts and kernels
export const getCurrentHost = createSelector(
  (state: AppState) => state.app.host,
  host => host
);

export const getCurrentKernel = createSelector(
  (state: AppState) => state.app.kernel,
  kernel => kernel
);

export const getCurrentKernelType = createSelector(
  [getCurrentKernel],
  kernel => {
    if (kernel && kernel.type) {
      return kernel.type;
    }
    return null;
  }
);

export const getCurrentHostType = createSelector([getCurrentHost], host => {
  if (host && host.type) {
    return host.type;
  }
  return null;
});

export const isCurrentKernelZeroMQ = createSelector(
  [getCurrentHostType, getCurrentKernelType],
  (hostType, kernelType) => {
    return hostType === "local" && kernelType === "zeromq";
  }
);

export const isCurrentHostJupyter = createSelector(
  [getCurrentHostType],
  hostType => hostType === "jupyter"
);

export const isCurrentKernelJupyterWebsocket = createSelector(
  [getCurrentHostType, getCurrentKernelType],
  (hostType, kernelType) => {
    return hostType === "jupyter" && kernelType === "websocket";
  }
);
