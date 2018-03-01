import { ActionsObservable } from "redux-observable";

import { actions, actionTypes, state as stateModule } from "@nteract/core";

import {
  acquireKernelInfo,
  watchExecutionStateEpic,
  launchKernelObservable,
  launchKernelEpic,
  launchKernelByNameEpic
} from "../../../src/notebook/epics/zeromq-kernels";

import { of } from "rxjs/observable/of";
import { toArray, catchError } from "rxjs/operators";

describe("launchKernelObservable", () => {
  test("returns an observable", () => {
    const obs = launchKernelObservable("python3", process.cwd());
    expect(obs.subscribe).toBeTruthy();
  });
});

describe("launchKernelEpic", () => {
  test("throws an error if given a bad action", async function() {
    const actionBuffer = [];
    const action$ = ActionsObservable.of(
      {
        type: actionTypes.LAUNCH_KERNEL,
        payload: {
          ref: "1234"
        }
      },
      {
        type: actionTypes.LAUNCH_KERNEL,
        payload: { kernelSpec: {} }
      }
    );

    const resultAction$ = await launchKernelEpic(action$)
      .pipe(toArray())
      .toPromise();
    expect(resultAction$).toEqual([
      {
        error: true,
        payload: {
          error: new Error("launchKernel needs a kernelSpec and a kernel ref"),
          ref: "1234"
        },
        type: "LAUNCH_KERNEL_FAILED"
      },
      {
        error: true,
        payload: {
          error: new Error("launchKernel needs a kernelSpec and a kernel ref"),
          ref: undefined
        },
        type: "LAUNCH_KERNEL_FAILED"
      }
    ]);
  });

  test("calls launchKernelObservable if given the correct action", async function() {
    const actionBuffer = [];
    const action$ = ActionsObservable.of(
      actions.launchKernel({
        kernelSpec: { spec: "hokey", name: "woohoo" },
        cwd: "~",
        selectNextKernel: true,
        ref: "123"
      })
    );

    const state = {
      core: stateModule.makeStateRecord(),
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
          hostRef: null,
          channels: expect.anything(),
          spawn: expect.anything(),
          connectionFile: "connectionFile.json",
          kernelSpecName: "woohoo",
          status: "launched"
        },
        ref: "123"
      }),
      actions.setExecutionState({
        kernelStatus: "launched",
        ref: "123"
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
