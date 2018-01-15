import { ActionsObservable } from "redux-observable";

import { dummyCommutable, dummy } from "@nteract/core/dummy";

import {
  load,
  newNotebook,
  setNotebook,
  extractNewKernel,
  convertRawNotebook,
  loadEpic,
  newNotebookEpic
} from "../../../src/notebook/epics/loading";

import { LOAD, NEW_NOTEBOOK, SET_NOTEBOOK } from "@nteract/core/actionTypes";

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

describe("convertRawNotebook", () => {
  test("converts a raw notebook", () => {
    const converted = convertRawNotebook("/tmp/test.ipynb", dummy);
    expect(converted.filename).toBe("/tmp/test.ipynb");

    const notebook = converted.notebook;
    expect(
      dummyCommutable.get("metadata").equals(notebook.get("metadata"))
    ).toBe(true);
  });
});

describe("loadingEpic", () => {
  test("errors without a filename", done => {
    const action$ = ActionsObservable.of({ type: LOAD });
    const responseActions = loadEpic(action$);
    responseActions.subscribe(
      _ => _,
      err => {
        expect(err.message).toBe("load needs a filename");
        done();
      },
      () => {
        done.fail();
      }
    );
  });
  test("errors when file cant be read", done => {
    const action$ = ActionsObservable.of({ type: LOAD, filename: "file" });
    const responseActions = loadEpic(action$);
    responseActions.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual(["ERROR"]);
      },
      () => done.fail(),
      () => done()
    );
  });
});

describe("newNotebookEpic", () => {
  test("calls new Kernel after creating a new notebook", done => {
    const action$ = ActionsObservable.of({ type: NEW_NOTEBOOK });
    const responseActions = newNotebookEpic(action$);
    responseActions.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([SET_NOTEBOOK, "LAUNCH_KERNEL"]);
      },
      () => done.fail(),
      () => done()
    );
  });
});
