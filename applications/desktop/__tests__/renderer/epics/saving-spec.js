jest.mock("fs");
import { ActionsObservable } from "redux-observable";
import { dummyStore, dummyCommutable } from "@nteract/core/dummy";

import { save, saveAs } from "@nteract/core/actions";

import {
  SAVE,
  SAVE_AS,
  DONE_SAVING,
  CHANGE_FILENAME
} from "@nteract/core/actionTypes";

import { saveEpic, saveAsEpic } from "../../../src/notebook/epics/saving";

import { of } from "rxjs/observable/of";
import { catchError, toArray } from "rxjs/operators";

describe("saveEpic", () => {
  test("saves the file using the notebook in the state tree", async function() {
    const store = dummyStore();

    const responses = await saveEpic(ActionsObservable.of(save()), store)
      .pipe(toArray())
      .toPromise();

    // TODO: This should be testing that the mocks for fs were called with the
    // filename and notebook from the state tree

    expect(responses).toEqual([
      { type: "DONE_SAVING", notebook: expect.anything() }
    ]);
  });
});

describe("saveAsEpic", () => {
  test("works when passed actions of type SAVE_AS", async function() {
    const store = dummyStore();

    const responses = await saveAsEpic(
      ActionsObservable.of(saveAs("great-filename")),
      store
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      { type: "CHANGE_FILENAME", filename: "great-filename" },
      { type: "SAVE" }
    ]);
  });
});
