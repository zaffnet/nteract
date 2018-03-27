jest.mock("fs");
import { ActionsObservable } from "redux-observable";
import { dummyStore, dummyCommutable } from "@nteract/core/dummy";

import { actions } from "@nteract/core";

import { saveEpic, saveAsEpic } from "../../../src/notebook/epics/saving";

import { of } from "rxjs/observable/of";
import { catchError, toArray } from "rxjs/operators";

describe("saveEpic", () => {
  test("saves the file using the notebook in the state tree", async function() {
    const store = dummyStore();

    const contentRef = store.getState().core.currentContentRef;

    const responses = await saveEpic(
      ActionsObservable.of(actions.save({ contentRef })),
      store
    )
      .pipe(toArray())
      .toPromise();

    // TODO: This should be testing that the mocks for fs were called with the
    // filename and notebook from the state tree

    expect(responses).toEqual([actions.saveFulfilled({ contentRef })]);
  });
});

describe("saveAsEpic", () => {
  test("works when passed actions of type SAVE_AS", async function() {
    const store = dummyStore();

    const responses = await saveAsEpic(
      ActionsObservable.of(
        actions.saveAs({ filepath: "great-filename", contentRef: "567" })
      ),
      store
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.changeFilename({ filepath: "great-filename", contentRef: "567" }),
      actions.save({ contentRef: "567" })
    ]);
  });
});
