// @flow
import { ActionsObservable } from "redux-observable";
import { launchKernelByName } from "../../src/actions";
import { launchWebSocketKernelEpic } from "../../src/epics";

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
        app: {
          host: {
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          },
          kernel: null,
          notificationSystem: { addNotification: jest.fn() }
        },
        document: Immutable.fromJS({
          notebook: {
            cellMap: {
              first: {
                source: "woo",
                cell_type: "code"
              },
              second: {
                source: "eh",
                cell_type: "code"
              }
            },
            cellOrder: ["first", "second"]
          }
        })
      }
    };

    const action$ = ActionsObservable.of(launchKernelByName("fancy", "/"));

    const responseActions = await launchWebSocketKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "LAUNCH_KERNEL_SUCCESSFUL",
        kernel: {
          type: "websocket",
          channels: expect.any(Subject),
          kernelSpecName: "fancy",
          id: "0"
        }
      }
    ]);
  });
});
