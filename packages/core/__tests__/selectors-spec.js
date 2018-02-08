import Immutable from "immutable";
import { dummyCommutable } from "../src/dummy";
import * as selectors from "../src/selectors";

describe("codeMirrorMode", () => {
  test("determines the right mode from the notebook metadata", () => {
    // TODO: better way to get dummy state?
    const state1 = {
      document: Immutable.Map({
        notebook: dummyCommutable
      })
    };
    const mode = selectors.codeMirrorMode(state1);
    expect(mode).toEqual(Immutable.fromJS({ name: "ipython", version: 3 }));

    const state2 = {
      document: Immutable.Map({
        notebook: dummyCommutable.setIn(
          ["metadata", "language_info", "codemirror_mode", "name"],
          "r"
        )
      })
    };
    const lang2 = selectors.codeMirrorMode(state2);
    expect(lang2).toEqual(Immutable.fromJS({ name: "r", version: 3 }));
  });
});
