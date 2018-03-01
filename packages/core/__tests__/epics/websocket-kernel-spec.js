// @flow
import * as Immutable from "immutable";
import { ActionsObservable } from "redux-observable";
import { Subject } from "rxjs/Subject";
import { emptyNotebook } from "@nteract/commutable";
import { actions, state as stateModule, epics as coreEpics } from "../../src";
import { toArray } from "rxjs/operators";

describe("launchWebSocketKernelEpic", () => {
  test("", async function() {
    const store = {
      getState() {
        return this.state;
      },
      state: {
        // $FlowFixMe
        app: stateModule.makeAppRecord({
          host: stateModule.makeJupyterHostRecord({
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
      actions.launchKernelByName({
        kernelSpecName: "fancy",
        cwd: "/",
        selectNextKernel: true
      })
    );

    const responseActions = await coreEpics
      .launchWebSocketKernelEpic(action$, store)
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
        core: stateModule.makeStateRecord({
          useCore: true,
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  type: "websocket",
                  channels: jest.fn(),
                  kernelSpecName: "fancy",
                  // $FlowFixMe: This is looking for real KernelId.
                  id: "0"
                })
              })
            })
          })
        }),
        app: stateModule.makeAppRecord({
          host: stateModule.makeJupyterHostRecord({
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          }),
          notificationSystem: { addNotification: jest.fn() }
        }),
        document: stateModule.makeDocumentRecord({
          notebook: emptyNotebook
        })
      }
    };

    const action$ = ActionsObservable.of(actions.interruptKernel({}));

    const responseActions = await coreEpics
      .interruptKernelEpic(action$, store)
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
