import * as React from "react";

import { HeaderEditor } from "../src/";

import renderer from "react-test-renderer";

describe("Header Editor", () => {
  it("renders correctly with no props", () => {
    const tree = renderer.create(<HeaderEditor />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
