// @flow

// FIXME FIXME FIXME SUPER WRONG FIXME FIXME FIXME
type AppState = {
  // The new way
  core: any,

  // The old way
  app: Object,
  comms: *,
  document: Object,
  config: Object
};

import type { KernelRef } from "../state/refs";

import { toJS, stringifyNotebook } from "@nteract/commutable";
import * as Immutable from "immutable";
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

export const kernelsByRef = createSelector(
  (state: AppState) => state.core.getIn(["entities", "kernels", "byRef"]),
  identity
);

// Get a kernel by kernelRef, using the `props` argument
export const kernel = createSelector(
  (state: AppState, { kernelRef }: { kernelRef: KernelRef }) =>
    kernelsByRef(state).get(kernelRef),
  identity
);

export const currentKernelRef = createSelector(
  (state: AppState) => state.core.kernelRef,
  identity
);

export const currentKernel = createSelector(
  currentKernelRef,
  (state: AppState) => state.core.getIn(["entities", "kernels", "byRef"]),
  (kernelRef, kernelsByRef) => {
    return kernelsByRef.get(kernelRef);
  }
);

export const currentKernelType = createSelector([currentKernel], kernel => {
  if (kernel && kernel.type) {
    return kernel.type;
  }
  return null;
});

export const currentKernelStatus = createSelector([currentKernel], kernel => {
  if (kernel && kernel.status) {
    return kernel.status;
  }
  return "not connected";
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

export const comms = createSelector((state: AppState) => state.comms, identity);

export const models = createSelector([comms], comms => comms.get("models"));

export const currentModel = createSelector(
  (state: AppState) => state.document,
  (state: AppState) => currentContentRef(state),
  (state: AppState) => currentContent(state),
  // TODO: if an application is setting the currentContent, assume we want to
  // use that. Otherwise, use the old method of looking into state.document.
  (document, currentContentRef, currentContent) => {
    if (currentContentRef) {
      // TODO: The app assumes that the model is not null. HOWEVER, the model
      // should really *be* nullable. I.e., components should check
      // communication before accessing nested values here.
      return currentContent.model;
    }
    return document;
  }
);

// TODO: if we're not looking at a notebook in the UI, there may not _be_ a
// notebook object to get. Do we return null? Throw an error?
export const currentNotebook = createSelector(currentModel, model =>
  model.get("notebook", null)
);

export const currentSavedNotebook = createSelector(currentModel, model =>
  model.get("savedNotebook")
);

export const cellPagers = createSelector(currentModel, model =>
  model.get("cellPagers")
);

export const currentLastSaved = createSelector(
  (state: AppState) => state.app.get("lastSaved"),
  (state: AppState) => currentContentRef(state),
  (state: AppState) => currentContent(state),
  // TODO: if an application is setting the currentContent, assume we want to
  // use that. Otherwise, use the old method of looking into state.document.
  (lastSaved, currentContentRef, currentContent) => {
    return currentContentRef ? currentContent.lastSaved : lastSaved;
  }
);

export const currentNotebookMetadata = createSelector(currentModel, model =>
  model.getIn(["notebook", "metadata"], Immutable.Map())
);

const CODE_MIRROR_MODE_DEFAULT = "text";
export const codeMirrorMode = createSelector(
  [currentNotebookMetadata],
  metadata =>
    metadata.getIn(["language_info", "codemirror_mode"]) ||
    metadata.getIn(["kernel_info", "language"]) ||
    metadata.getIn(["kernelspec", "language"]) ||
    CODE_MIRROR_MODE_DEFAULT
);

export const currentDisplayName = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.getIn(["kernelspec", "display_name"], "")
);

export const currentNotebookGithubUsername = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.get("github_username", null)
);

export const currentNotebookGistId = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.get("gist_id", null)
);

export const currentNotebookJS = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return toJS(notebook);
  }
  return null;
});

export const currentNotebookString = createSelector(
  [currentNotebookJS],
  notebookJS => {
    if (notebookJS) {
      return stringifyNotebook(notebookJS);
    }
    return "";
  }
);

export const currentFocusedCellId = createSelector(currentModel, model =>
  model.get("cellFocused")
);

export const currentFocusedEditorId = createSelector(currentModel, model =>
  model.get("editorFocused")
);

export const transientCellMap = createSelector(currentModel, model =>
  model.getIn(["transient", "cellMap"], Immutable.Map())
);

export const currentCellMap = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return notebook.get("cellMap", Immutable.Map());
  }
  return null;
});

export const currentCellOrder = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return notebook.get("cellOrder");
  }
  return null;
});

export const currentCodeCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      return cellOrder.filter(
        id => cellMap.getIn([id, "cell_type"]) === "code"
      );
    }
    return Immutable.List();
  }
);

export const currentCodeCellIdsBelow = createSelector(
  [currentFocusedCellId, currentCellMap, currentCellOrder],
  (focusedCellId, cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      const index = cellOrder.indexOf(focusedCellId);
      return cellOrder
        .skip(index)
        .filter(id => cellMap.getIn([id, "cell_type"]) === "code");
    }
    return Immutable.List();
  }
);

export const currentHiddenCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      return cellOrder.filter(id =>
        cellMap.getIn([id, "metadata", "inputHidden"])
      );
    }
    return null;
  }
);

export const currentIdsOfHiddenOutputs = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder): Immutable.List<any> => {
    if (!cellOrder || !cellMap) {
      return Immutable.List();
    }

    return cellOrder.filter(cellId =>
      cellMap.getIn([cellId, "metadata", "outputHidden"])
    );
  }
);

// TODO: we can get the filename from the top-level instead of the model?
export const currentFilename: (state: *) => string = createSelector(
  (state: AppState) => state.document,
  (state: AppState) => currentContentRef(state),
  (state: AppState) => currentContent(state),
  // TODO: if an application is setting the currentContent, assume we want to
  // use that. Otherwise, use the old method of looking into state.document.
  (document, currentContentRef, currentContent) => {
    if (currentContentRef) {
      return currentContent.path;
    }
    return document.filename;
  }
);

export const modalType = createSelector(
  (state: AppState) => state.core.entities.modals.modalType,
  identity
);

export const currentTheme: (state: *) => string = createSelector(
  (state: AppState) => state.config.get("theme", "light"),
  identity
);

// TODO: These selectors all have "Core" suffixes that will be removed when we
// fully switch over to using the new state tree under state.core.

export const hostByRefCore = createSelector(
  (state: AppState, { hostRef }) =>
    state.core.getIn(["entities", "hosts", "byRef", hostRef]),
  identity
);

export const communicationKernelspecsByRefCore = createSelector(
  (state: AppState, { kernelspecsRef }) =>
    state.core.getIn(["communication", "kernelspecs", "byRef", kernelspecsRef]),
  identity
);

export const kernelspecsByRefCore = createSelector(
  (state: AppState, { kernelspecsRef }) =>
    state.core.getIn(["entities", "kernelspecs", "byRef", kernelspecsRef]),
  identity
);

export const currentContentRef = createSelector(
  (state: AppState) => state.core.currentContentRef,
  identity
);

export const currentContent = createSelector(
  (state: AppState) => state.core.currentContentRef,
  (state: AppState) => state.core.entities.contents.byRef,
  (contentRef, byRef) => byRef.get(contentRef)
);

export const contentByRef = createSelector(
  (state: AppState, { contentRef }) =>
    state.core.entities.contents.byRef.get(contentRef),
  identity
);

export const notificationSystem = createSelector(
  (state: AppState) => state.app.get("notificationSystem"),
  identity
);
