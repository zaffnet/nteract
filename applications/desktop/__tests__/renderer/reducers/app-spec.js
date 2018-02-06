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
