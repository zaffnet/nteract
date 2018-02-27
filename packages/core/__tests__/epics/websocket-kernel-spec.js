// @flow
import { ActionsObservable } from "redux-observable";
import { launchKernelByName, interruptKernel } from "../../src/actions";

import {
  makeAppRecord,
  makeOldJupyterHostRecord,
  makeOldRemoteKernelRecord,
  makeDocumentRecord
} from "../../src/state";

import { emptyNotebook } from "@nteract/commutable";
import {
  launchWebSocketKernelEpic,
  interruptKernelEpic
} from "../../src/epics";

import { toArray } from "rxjs/operators";

import { Subject } from "rxjs/Subject";

import * as Immutable from "immutable";

describe("launchWebSocketKernelEpic", () => {
  test("", async function() {
    const store = {
      getState() {
        return this.state;
      },
      state: {
        // $FlowFixMe
        app: makeAppRecord({
          host: makeOldJupyterHostRecord({
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          }),
          kernel: null,
          notificationSystem: { addNotification: jest.fn() }
        }),
        document: Immutable.fromJS({
          notebook: emptyNotebook
        })
      }
    };

    const action$ = ActionsObservable.of(
      launchKernelByName({ kernelSpecName: "fancy", cwd: "/" })
    );

    const responseActions = await launchWebSocketKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "LAUNCH_KERNEL_SUCCESSFUL",
        payload: {
          kernel: {
            type: "websocket",
            channels: expect.any(Subject),
            kernelSpecName: "fancy",
            cwd: "/",
            id: "0"
          }
        }
      }
    ]);
  });
});

describe("interruptKernelEpic", () => {
  test("", async function() {
    const store = {
      getState() {
        return this.state;
      },
      state: {
        // $FlowFixMe
        app: makeAppRecord({
          host: makeOldJupyterHostRecord({
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          }),
          kernel: makeOldRemoteKernelRecord({
            type: "websocket",
            channels: jest.fn(),
            kernelSpecName: "fancy",
            // $FlowFixMe: This is looking for real KernelId.
            id: "0"
          }),
          notificationSystem: { addNotification: jest.fn() }
        }),
        document: makeDocumentRecord({
          notebook: emptyNotebook
        })
      }
    };

    const action$ = ActionsObservable.of(interruptKernel({}));

    const responseActions = await interruptKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "INTERRUPT_KERNEL_SUCCESSFUL",
        payload: {}
      }
    ]);
  });
});
