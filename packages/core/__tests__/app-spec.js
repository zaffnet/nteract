import * as actionTypes from "@nteract/core/actionTypes";
import { app } from "@nteract/core/reducers";
import {
  AppRecord,
  makeAppRecord,
  makeLocalKernelRecord
} from "@nteract/types/core/records";

describe("startSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = makeAppRecord({
      kernel: makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.START_SAVING };

    const state = app(originalState, action);
    expect(state.isSaving).toBe(true);
  });
});

describe("doneSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = makeAppRecord({
      kernel: makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.DONE_SAVING };

    const state = app(originalState, action);
    expect(state.isSaving).toBe(false);
  });
});

describe("setExecutionState", () => {
  test("should set the exeuction state to the given value", () => {
    const originalState = makeAppRecord({
      kernel: makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = {
      type: actionTypes.SET_EXECUTION_STATE,
      kernelStatus: "idle"
    };

    const state = app(originalState, action);
    expect(state.kernel.status).toBe("idle");
  });
});

describe("setNotificationSystem", () => {
  test("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = makeAppRecord({
      kernel: makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.SET_NOTIFICATION_SYSTEM };

    const state = app(originalState, action);
    expect(state.notificationSystem).toBeNull();
  });
  test("sets the notificationSystem if given", () => {
    const originalState = makeAppRecord({
      kernel: makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = {
      type: actionTypes.SET_NOTIFICATION_SYSTEM,
      notificationSystem: ""
    };

    const state = app(originalState, action);
    expect(state.notificationSystem).toBe("");
  });
});

describe("setGithubToken", () => {
  test("calls setGithubToken", () => {
    const originalState = makeAppRecord({
      githubToken: null
    });

    const action = { type: actionTypes.SET_GITHUB_TOKEN, githubToken: "TOKEN" };

    const state = app(originalState, action);
    expect(state.githubToken).toEqual("TOKEN");
  });
});
