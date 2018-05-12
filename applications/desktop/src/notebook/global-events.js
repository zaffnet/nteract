/* @flow */

import type { Store } from "redux";

import { is } from "immutable";
import { selectors } from "@nteract/core";

import type { AppState, KernelRef, ContentRef } from "@nteract/core";

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

export function beforeUnload(
  contentRef: ContentRef,
  store: Store<AppState, Action>,
  e: any
) {
  const state = store.getState();
  const model = selectors.model(state, { contentRef });

  if (!model || model.type !== "notebook") {
    // No model on the page, don't block them
    return;
  }

  if (selectors.notebook.isDirty(model)) {
    // Will prevent closing "will-prevent-unload"
    e.returnValue = true;
  }
}

export function initGlobalHandlers(
  contentRef: ContentRef,
  store: Store<AppState, Action>
) {
  window.onbeforeunload = beforeUnload.bind(null, contentRef, store);
  window.onunload = unload.bind(null, store);
}
