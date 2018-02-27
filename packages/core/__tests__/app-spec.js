import { actionTypes, reducers, state as stateModule } from "@nteract/core";

describe("startSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = stateModule.makeAppRecord({
      kernel: stateModule.makeOldLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.START_SAVING };

    const state = reducers.app(originalState, action);
    expect(state.isSaving).toBe(true);
  });
});

describe("doneSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = stateModule.makeAppRecord({
      kernel: stateModule.makeOldLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.DONE_SAVING };

    const state = reducers.app(originalState, action);
    expect(state.isSaving).toBe(false);
  });
});

describe("setExecutionState", () => {
  test("should set the exeuction state to the given value", () => {
    const originalState = stateModule.makeAppRecord({
      kernel: stateModule.makeOldLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = {
      type: actionTypes.SET_EXECUTION_STATE,
      payload: { kernelStatus: "idle" }
    };

    const state = reducers.app(originalState, action);
    expect(state.kernel.status).toBe("idle");
  });
});

describe("setNotificationSystem", () => {
  test("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = stateModule.makeAppRecord({
      kernel: stateModule.makeOldLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = { type: actionTypes.SET_NOTIFICATION_SYSTEM };

    const state = reducers.app(originalState, action);
    expect(state.notificationSystem).toEqual(originalState.notificationSystem);
  });
  test("sets the notificationSystem if given", () => {
    const originalState = stateModule.makeAppRecord({
      kernel: stateModule.makeOldLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });

    const action = {
      type: actionTypes.SET_NOTIFICATION_SYSTEM,
      notificationSystem: ""
    };

    const state = reducers.app(originalState, action);
    expect(state.notificationSystem).toBe("");
  });
});

describe("setGithubToken", () => {
  test("calls setGithubToken", () => {
    const originalState = stateModule.makeAppRecord({
      githubToken: null
    });

    const action = { type: actionTypes.SET_GITHUB_TOKEN, githubToken: "TOKEN" };

    const state = reducers.app(originalState, action);
    expect(state.githubToken).toEqual("TOKEN");
  });
});
