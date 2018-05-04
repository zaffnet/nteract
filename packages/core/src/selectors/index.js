// @flow

import * as Immutable from "immutable";
import * as notebook from "./notebook";
import { createSelector } from "reselect";
import { makeEmptyModel } from "../state/entities/contents";

import type {
  AppState,
  JupyterHostRecord,
  ContentRef,
  ContentModel,
  KernelRef,
  KernelspecsByRefRecord,
  ContentRecord
} from "../state";

// Export sub-selectors (those that operate on contents models for instance)
export { notebook };

function identity<T>(thing: T): T {
  return thing;
}

export const serverConfig = (host: JupyterHostRecord) => {
  return {
    endpoint: host.origin + host.basePath,
    crossDomain: host.crossDomain,
    token: host.token
  };
};

export const userTheme = (state: AppState): string =>
  state.config.get("theme", "light");

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

export const contentByRef = (state: AppState) =>
  state.core.entities.contents.byRef;

export const content = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => contentByRef(state).get(contentRef);

export const model = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => {
  const content = contentByRef(state).get(contentRef);
  if (!content) {
    return null;
  }
  return content.model;
};

export const currentContentRef = (state: AppState) =>
  state.core.currentContentRef;

export const currentContent: (
  state: AppState
) => ?ContentRecord = createSelector(
  currentContentRef,
  contentByRef,
  (contentRef, byRef) => (contentRef ? byRef.get(contentRef) : null)
);

export const currentKernelspecsRef = (state: AppState) =>
  state.core.currentKernelspecsRef;

export const kernelspecsByRef = (state: AppState) =>
  state.core.entities.kernelspecs.byRef;

export const currentKernelspecs: (
  state: AppState
) => ?KernelspecsByRefRecord = createSelector(
  currentKernelspecsRef,
  kernelspecsByRef,
  (ref, byRef) => (ref ? byRef.get(ref) : null)
);

export const kernelsByRef = (state: AppState) =>
  state.core.entities.kernels.byRef;

export const kernel = (
  state: AppState,
  { kernelRef }: { kernelRef: KernelRef }
) => kernelsByRef(state).get(kernelRef);

export const currentKernelRef = (state: AppState) => state.core.kernelRef;

export const currentKernel = createSelector(
  currentKernelRef,
  kernelsByRef,
  (kernelRef, byRef) => (kernelRef ? byRef.get(kernelRef) : null)
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

// NOTE: These are comm models, not contents models
export const models = createSelector([comms], comms => comms.get("models"));

export const currentModel: (state: AppState) => ContentModel = createSelector(
  (state: AppState) => currentContent(state),
  currentContent => {
    return currentContent ? currentContent.model : makeEmptyModel();
  }
);

export const currentContentType: (
  state: AppState
) => "notebook" | "dummy" | "directory" | "file" | null = createSelector(
  (state: AppState) => currentContent(state),
  content => (content ? content.type : null)
);

export const currentLastSaved = createSelector(
  (state: AppState) => currentContent(state),
  currentContent => (currentContent ? currentContent.lastSaved : null)
);

export const currentFilepath: (state: *) => string = createSelector(
  (state: AppState) => currentContent(state),
  currentContent => {
    return currentContent ? currentContent.filepath : "";
  }
);

export const modalType = createSelector(
  (state: AppState) => state.core.entities.modals.modalType,
  identity
);

export const currentTheme: (state: *) => "light" | "dark" = createSelector(
  (state: AppState) => state.config.get("theme", "light"),
  identity
);

export const notificationSystem = createSelector(
  (state: AppState) => state.app.get("notificationSystem"),
  identity
);
