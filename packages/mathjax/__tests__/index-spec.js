import * as React from "react";
import { Node, Provider } from "../src";

import toJson from "enzyme-to-json";

import Enzyme, { mount } from "enzyme";

describe("MathJax", () => {
  test("Node can be renderered without provider", () => {
    const wrapper = mount(<Node>x^2 + y = 3</Node>);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test("Nodes use existing provider", () => {
    const wrapper = mount(
      <Provider>
        <Node>x^2 + y = 3</Node>
        <Node>x^3 + y = 2</Node>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
