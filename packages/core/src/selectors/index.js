// @flow
import type { AppState } from "@nteract/types/core/records";
import { toJS, stringifyNotebook } from "@nteract/commutable";

import { createSelector } from "reselect";

const identity = thing => thing;
const serverUrl = (state: AppState) => state.app.host.serverUrl;
const crossDomain = (state: AppState) => state.app.host.crossDomain;
const token = (state: AppState) => state.app.host.token;

export const serverConfig = createSelector(
  [serverUrl, crossDomain, token],
  (serverUrl, crossDomain, token) => ({
    endpoint: serverUrl,
    crossDomain,
    token
  })
);

export const userPreferences = createSelector(
  (state: AppState) => state.config,
  config => config.toJS()
);

export const appVersion = createSelector(
  (state: AppState) => state.app.version,
  identity
);

// Quick memoized host and kernel selection.
//
// Intended to be useful for a core app and be future proof for when we have
// both refs and selected/current hosts and kernels
export const currentHost = createSelector(
  (state: AppState) => state.app.host,
  identity
);

export const currentKernel = createSelector(
  (state: AppState) => state.app.kernel,
  identity
);

export const currentKernelType = createSelector([currentKernel], kernel => {
  if (kernel && kernel.type) {
    return kernel.type;
  }
  return null;
});

export const currentHostType = createSelector([currentHost], host => {
  if (host && host.type) {
    return host.type;
  }
  return null;
});

export const isCurrentKernelZeroMQ = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "local" && kernelType === "zeromq";
  }
);

export const isCurrentHostJupyter = createSelector(
  [currentHostType],
  hostType => hostType === "jupyter"
);

export const isCurrentKernelJupyterWebsocket = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "jupyter" && kernelType === "websocket";
  }
);

// TODO: if we're not looking at a notebook in the UI, there may not _be_ a
// notebook object to get. Do we return null? Throw an error?
export const currentNotebook = createSelector(
  (state: AppState) => state.document.get("notebook"),
  identity
);

export const currentSavedNotebook = createSelector(
  (state: AppState) => state.document.get("savedNotebook"),
  identity
);

export const currentNotebookGithubUsername = createSelector(
  [currentNotebook],
  notebook => notebook.getIn(["metadata", "github_username"])
);

export const currentNotebookGistId = createSelector(
  [currentNotebook],
  notebook => notebook.getIn(["metadata", "gist_id"])
);

export const currentNotebookJS = createSelector([currentNotebook], notebook =>
  toJS(notebook)
);

export const currentNotebookString = createSelector(
  [currentNotebookJS],
  notebookJS => stringifyNotebook(notebookJS)
);

export const currentFocusedCellId = createSelector(
  (state: AppState) => state.document.get("cellFocused"),
  identity
);

export const currentCellMap = createSelector([currentNotebook], notebook =>
  notebook.get("cellMap")
);

export const currentCellOrder = createSelector([currentNotebook], notebook =>
  notebook.get("cellOrder")
);

export const currentCodeCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) => {
    return cellOrder.filter(id => cellMap.getIn([id, "cell_type"]) === "code");
  }
);

export const currentCodeCellIdsBelow = createSelector(
  [currentFocusedCellId, currentCellMap, currentCellOrder],
  (focusedCellId, cellMap, cellOrder) => {
    const index = cellOrder.indexOf(focusedCellId);
    return cellOrder
      .skip(index)
      .filter(id => cellMap.getIn([id, "cell_type"]) === "code");
  }
);

export const currentHiddenCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) =>
    cellOrder.filter(id => cellMap.getIn([id, "metadata", "inputHidden"]))
);

export const currentFilename = createSelector(
  (state: AppState) => state.document.get("filename"),
  identity
);
