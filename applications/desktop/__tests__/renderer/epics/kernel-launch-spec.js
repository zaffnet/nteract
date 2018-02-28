import { ActionsObservable } from "redux-observable";

import { actions, actionTypes } from "@nteract/core";

import {
  acquireKernelInfo,
  watchExecutionStateEpic,
  launchKernelObservable,
  launchKernelEpic,
  launchKernelByNameEpic
} from "../../../src/notebook/epics/zeromq-kernels";

import { of } from "rxjs/observable/of";
import { toArray, share } from "rxjs/operators";

describe("launchKernelObservable", () => {
  test("returns an observable", () => {
    const obs = launchKernelObservable("python3", process.cwd());
    expect(obs.subscribe).toBeTruthy();
  });
});

describe("launchKernelEpic", () => {
  test("throws an error if given a bad action", done => {
    const actionBuffer = [];
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL
    }).pipe(share());
    const obs = launchKernelEpic(action$);
    obs.subscribe(
      x => {
        expect(x.type).toEqual(actionTypes.LAUNCH_KERNEL_FAILED);
        actionBuffer.push(x.type);
        done();
      },
      err => done.fail(err)
    );
  });

  test("calls launchKernelObservable if given the correct action", async function() {
    const actionBuffer = [];
    const action$ = ActionsObservable.of(
      actions.launchKernel({
        kernelSpec: { spec: "hokey", name: "woohoo" },
        cwd: "~",
        selectNextKernel: true
      })
    );

    const state = {
      app: {
        kernel: null
      }
    };

    const store = {
      getState: () => {
        return state;
      }
    };

    const responses = await launchKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.setNotebookKernelInfo({ spec: "hokey", name: "woohoo" }),
      actions.launchKernelSuccessful({
        kernel: {
          ref: expect.any(String),
          lastActivity: null,
          type: "zeromq",
          cwd: "~",
          channels: expect.anything(),
          spawn: expect.anything(),
          connectionFile: "connectionFile.json",
          kernelSpecName: "woohoo",
          status: "launched"
        }
      }),
      actions.setExecutionState({
        kernelStatus: "launched"
      })
    ]);
  });
});

describe("launchKernelByNameEpic", () => {
  test("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = ActionsObservable.of(
      actions.launchKernelByName({
        kernelSpecName: "python3",
        cwd: "~"
      })
    );
    const obs = launchKernelByNameEpic(action$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionTypes.LAUNCH_KERNEL]);
        done();
      },
      err => done.fail(err)
    );
  });
});
