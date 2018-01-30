import React from "react";
import renderer from "react-test-renderer";

import LaTeXDisplay from "../src/latex";

describe("LaTeXDisplay", () => {
  it("processes basic LaTeX", () => {
    const tree = renderer
      .create(<LaTeXDisplay data={"x^2 + y = 3"} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
