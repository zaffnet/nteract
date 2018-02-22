import { ActionsObservable } from "redux-observable";

import { monocellNotebook } from "@nteract/commutable";

import { dummyCommutable, dummy } from "@nteract/core/dummy";

import {
  load,
  newNotebook,
  setNotebook,
  extractNewKernel,
  convertRawNotebook,
  fetchContentEpic,
  newNotebookEpic
} from "../../../src/notebook/epics/loading";

import { actionTypes } from "@nteract/core";

import { toArray } from "rxjs/operators";

const path = require("path");

describe("extractNewKernel", () => {
  test("extracts and launches the kernel from a notebook", () => {
    expect(extractNewKernel("/tmp/test.ipynb", dummyCommutable)).toEqual({
      kernelSpecName: "python3",
      cwd: path.resolve("/tmp")
    });
  });
});

describe("loadingEpic", () => {
  test("errors without a filename", done => {
    const action$ = ActionsObservable.of({
      type: "CORE/FETCH_CONTENT",
      payload: {}
    });
    const responseActions = fetchContentEpic(action$);
    responseActions.subscribe(
      _ => _,
      err => {
        expect(err.message).toBe("fetch content needs a path");
        done();
      },
      () => {
        done.fail();
      }
    );
  });
  test("errors when file cant be read", async function() {
    const action$ = ActionsObservable.of({
      type: "CORE/FETCH_CONTENT",
      payload: { path: "file" }
    });

    const responseActions = await fetchContentEpic(action$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        payload: {
          error: expect.anything(),
          path: "file"
        },
        type: "CORE/FETCH_CONTENT_FAILED"
      }
    ]);
  });
});

describe("newNotebookEpic", () => {
  test("calls new Kernel after creating a new notebook", async function() {
    const action$ = ActionsObservable.of({
      type: actionTypes.NEW_NOTEBOOK,
      kernelSpec: {
        name: "hylang"
      }
    });
    const responseActions = await newNotebookEpic(action$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        filename: null,
        type: actionTypes.SET_NOTEBOOK,
        notebook: monocellNotebook.setIn(
          ["metadata", "kernel_info", "name"],
          "hylang"
        )
      }
    ]);
  });
});
