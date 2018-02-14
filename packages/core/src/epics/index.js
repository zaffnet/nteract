// @flow

import {
  executeCellEpic,
  updateDisplayEpic,
  executeAllCellsEpic
} from "./execute";

import { commListenEpic } from "./comm";

import {
  launchWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic
} from "./websocket-kernel";

import {
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic
} from "./kernel-lifecycle";

import { fetchKernelspecsEpic } from "./kernelspecs";

import { fetchContentEpic, setNotebookEpic, saveContentEpic } from "./contents";

// Because `@nteract/core/epics` ends up being a commonjs import, we can't currently
// rely on a default export or a `import * as epics from ""@nteract/core/epics"`
// as it would collide the array with the named exports
const allEpics = [
  executeCellEpic,
  updateDisplayEpic,
  executeAllCellsEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic,
  fetchKernelspecsEpic,
  fetchContentEpic,
  setNotebookEpic,
  saveContentEpic
];

export {
  allEpics,
  executeCellEpic,
  updateDisplayEpic,
  executeAllCellsEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic,
  fetchKernelspecsEpic,
  fetchContentEpic,
  setNotebookEpic,
  saveContentEpic
};
