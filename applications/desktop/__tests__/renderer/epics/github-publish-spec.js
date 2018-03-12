import { ActionsObservable } from "redux-observable";

import { dummy, dummyStore, dummyCommutable } from "@nteract/core/dummy";

import { toArray } from "rxjs/operators";

import { actionTypes } from "@nteract/core";

import {
  publishNotebookObservable,
  createGistCallback,
  handleGistAction,
  notifyUser,
  publishEpic
} from "../../../src/notebook/epics/github-publish";

const GitHub = () => ({
  authenticate: () => {},
  gists: {
    edit: (request, callback) => {
      callback(null, { data: { id: 123, html_url: "foo" } });
    },
    create: (request, callback) => {
      callback(null, { data: { id: 123, html_url: "foo" } });
    }
  },
  users: {
    get: (request, callback) => callback(null, { data: { login: "jdetle" } })
  }
});

const createNotificationSystem = () => ({
  addNotification: () => {},
  render: () => null
});

describe("handleGistAction", () => {
  test("returns an observable from User Action", () => {
    const publishUserAction = { type: actionTypes.PUBLISH_USER_GIST };
    const store = dummyStore();
    const handleGist = handleGistAction(store, publishUserAction);
    expect(handleGist.subscribe).not.toBeNull();
  });
  test("returns an observable from anonymous Action", () => {
    const publishAnonymousAction = { type: "PUBLISH_ANONYMOUS_GIST" };
    const store = dummyStore();
    const handleGist = handleGistAction(store, publishAnonymousAction);
    expect(handleGist.subscribe).not.toBeNull();
  });
});

describe("notifyUser", () => {
  test("notifies a user that gist has been uploaded", () => {
    const store = dummyStore();
    const notificationSystem = store.getState().app.notificationSystem;

    notificationSystem.addNotification = jest.fn();

    notifyUser("filename", "gistID", notificationSystem);
    expect(notificationSystem.addNotification).toBeCalledWith(
      expect.objectContaining({
        title: "Gist uploaded",
        message: "filename is ready",
        dismissible: true,
        position: "tr",
        level: "success"
      })
    );
  });
});
