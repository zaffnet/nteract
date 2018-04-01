/* @flow */

import type { Store } from "redux";

import { dialog } from "electron";
import { is } from "immutable";
import { selectors, state as stateModule } from "@nteract/core";

import { killKernelImmediately } from "./epics/zeromq-kernels";

export function unload(store: Store<stateModule.AppState, Action>) {
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

function isDirty(state: stateModule.AppState) {
  // Desktop should never be in a state that it has loaded a non-notebook
  // document, nor that contents wouldn't be on the page, so we let those cases
  // pass through
  const contentRef = selectors.currentContentRef(state);
  if (!contentRef) {
    return false;
  }
  const model = selectors.model(state, { contentRef });
  if (!model || model.type !== "notebook") {
    return false;
  }

  return selectors.notebook.isDirty(model);
}

export function beforeUnload(
  store: Store<stateModule.AppState, Action>,
  e: any
) {
  const state = store.getState();

  if (isDirty(state)) {
    // Will prevent closing "will-prevent-unload"
    e.returnValue = true;
  }
}

export function initGlobalHandlers(store: Store<stateModule.AppState, Action>) {
  window.onbeforeunload = beforeUnload.bind(null, store);
  window.onunload = unload.bind(null, store);
}
