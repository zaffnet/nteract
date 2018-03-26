/* @flow */

import type { Store } from "redux";
import type { AppState } from "@nteract/core/src/state";

import { dialog } from "electron";
import { is } from "immutable";
import { selectors } from "@nteract/core";

import { killKernelImmediately } from "./epics/zeromq-kernels";

export function unload(store: Store<AppState, Action>) {
  const kernel = selectors.currentKernel(store.getState());
  if (kernel && kernel.type === "zeromq") {
    // TODO: Do we need to provide a KernelRef here?
    killKernelImmediately(kernel);
  } else if (kernel && kernel.type) {
    // Since desktop doesn't implement websocket backed kernels and this path
    // would be hidden without a loud error, we're using an alert on exit
    alert("ERROR: kernel existed yet was not zeromq backed");
  }
  return;
}

function hasBeenSaved(state: AppState) {
  const contentRef = selectors.currentContentRef(state);
  if (!contentRef) {
    return false;
  }
  const model = selectors.model(state, { contentRef });
  if (!model || model.type !== "notebook") {
    return false;
  }

  return selectors.notebook.hasBeenSaved(model);
}

export function beforeUnload(store: Store<AppState, Action>, e: any) {
  const state = store.getState();

  if (!hasBeenSaved(state)) {
    // Will prevent closing "will-prevent-unload"
    e.returnValue = true;
  }
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  window.onbeforeunload = beforeUnload.bind(null, store);
  window.onunload = unload.bind(null, store);
}
