/* @flow */

import type { Store } from "redux";
import type { AppState } from "@nteract/core/src/state";

import { dialog } from "electron";
import { is } from "immutable";
import { selectors } from "@nteract/core";

import { killKernelImmediately } from "./epics/zeromq-kernels";

export function unload(store: Store<AppState, Action>) {
  const kernel = selectors.currentKernel(store.getState());
  if (kernel) {
    killKernelImmediately(kernel);
  }
  return;
}

export function beforeUnload(store: Store<AppState, Action>, e: any) {
  const state = store.getState();
  const saved = is(
    selectors.currentNotebook(state),
    selectors.currentSavedNotebook(state)
  );
  if (!saved) {
    // Will prevent closing "will-prevent-unload"
    e.returnValue = true;
  }
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  window.onbeforeunload = beforeUnload.bind(null, store);
  window.onunload = unload.bind(null, store);
}
