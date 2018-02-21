import { ActionsObservable } from "redux-observable";

import * as actionTypes from "@nteract/core/actionTypes";

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
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey", name: "woohoo" },
      cwd: "~"
    });

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
      {
        type: actionTypes.SET_KERNEL_INFO,
        kernelInfo: { spec: "hokey", name: "woohoo" }
      },
      {
        type: actionTypes.LAUNCH_KERNEL_SUCCESSFUL,
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
      },
      {
        type: "SET_EXECUTION_STATE",
        kernelStatus: "launched"
      }
    ]);
  });
});

describe("launchKernelByNameEpic", () => {
  test("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python3",
      cwd: "~"
    });
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
