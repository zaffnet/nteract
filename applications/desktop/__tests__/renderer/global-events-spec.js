import { dummyStore } from "@nteract/core/dummy";
import * as globalEvents from "../../src/notebook/global-events";

describe("beforeUnload", () => {
  test("should set event.returnValue if notebook is modified to prevent unload", () => {
    const store = dummyStore();

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).toBeDefined();
  });

  test("should should not set event.returnValue if notebook is saved", () => {
    const store = dummyStore({ saved: true });

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).toBeUndefined();
  });
});

describe("initGlobalHandlers", () => {
  test("adds an unload poperty to the window object", () => {
    const store = dummyStore();
    globalEvents.initGlobalHandlers(store);
    expect(global.window.onunload).toBeDefined();
    expect(global.window.onbeforeunload).toBeDefined();
  });
});
