import * as actionTypes from "@nteract/core/actionTypes";
import reducers from "../../../src/notebook/reducers";
import {
  AppRecord,
  makeAppRecord,
  makeLocalKernelRecord
} from "@nteract/types/core/records";

const Github = require("github");

describe("setNotificationSystem", () => {
  test("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = {
      app: makeAppRecord({
        kernel: makeLocalKernelRecord({
          channels: false,
          spawn: false,
          connectionFile: false
        })
      })
    };

    const action = { type: actionTypes.SET_NOTIFICATION_SYSTEM };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).toBeNull();
  });
  test("sets the notificationSystem if given", () => {
    const originalState = {
      app: makeAppRecord({
        kernel: makeLocalKernelRecord({
          channels: false,
          spawn: false,
          connectionFile: false
        })
      })
    };

    const action = {
      type: actionTypes.SET_NOTIFICATION_SYSTEM,
      notificationSystem: ""
    };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).toBe("");
  });
});

describe("interruptKernel", () => {
  test("sends a SIGINT and clears the kernel", () => {
    const originalState = {
      app: makeAppRecord({
        kernel: makeLocalKernelRecord({
          channels: false,
          spawn: {
            kill: () => {}
          },
          connectionFile: false
        })
      })
    };

    const action = { type: actionTypes.INTERRUPT_KERNEL };

    const state = reducers(originalState, action);
    expect(state.app).toEqual(originalState.app);
  });
});

describe("launchKernel", () => {
  test("creates a new kernel", () => {
    const originalState = {
      app: makeAppRecord({
        kernel: makeLocalKernelRecord({
          channels: false,
          spawn: false,
          connectionFile: false
        })
      })
    };

    const action = {
      type: actionTypes.LAUNCH_KERNEL_SUCCESSFUL,
      kernel: {
        channels: "test_channels",
        spawn: "test_spawn",
        kernelSpecName: "test_name",
        status: "starting"
      }
    };

    const state = reducers(originalState, action);
    expect(state.app.kernel.status).toBe("starting");
    expect(state.app.kernel.kernelSpecName).toBe("test_name");
    expect(state.app.kernel.spawn).toBe("test_spawn");
    expect(state.app.kernel.channels).toBe("test_channels");
  });
});

describe("setGithubToken", () => {
  test("calls setGithubToken", () => {
    const originalState = {
      app: makeAppRecord({
        github: new Github(),
        githubToken: null
      })
    };

    const action = { type: actionTypes.SET_GITHUB_TOKEN, githubToken: "TOKEN" };

    const state = reducers(originalState, action);
    // this is a crappy way of testing this
    expect(state.app.github).not.toBeNull();
    expect(state.app.githubToken).not.toBeNull();
  });
});

describe("doneSavingConfig", () => {
  test("updates when the config was saved", () => {
    const originalState = { app: makeAppRecord({ configLastSaved: null }) };

    const action = { type: actionTypes.DONE_SAVING_CONFIG };

    const state = reducers(originalState, action);
    expect(state.app.configLastSaved).toEqual(expect.any(Date));
  });
});
