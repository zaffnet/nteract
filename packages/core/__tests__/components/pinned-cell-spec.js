// @flow
import * as React from "react";
import renderer from "react-test-renderer";

import {
  StickyCellContainer,
  PinnedPlaceHolderCell
} from "../../src/components/pinned-cell";

describe("Sticky Cell Container", () => {
  test("creates a container when there are children", () => {
    const component = renderer.create(
      <StickyCellContainer>
        <div>cell one</div>
        <div>cell two</div>
      </StickyCellContainer>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("returns null when there are no children", () => {
    const component = renderer.create(<StickyCellContainer />);
    let tree = component.toJSON();
    expect(tree).toBeNull();
    expect(tree).toMatchSnapshot();
  });
});

describe("PinnedPlaceHolderCell", () => {
  test("has a snapshot test at least", () => {
    const component = renderer.create(<PinnedPlaceHolderCell />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
