// @flow

import * as React from "react";
import { Node, Provider } from "../src";
import renderer from "react-test-renderer";

import toJson from "enzyme-to-json";

import Enzyme, { shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

describe("MathJax", () => {
  test("Node can be renderered without provider", () => {
    const wrapper = mount(<Node>x^2 + y = 3</Node>);
    expect(toJson(wrapper)).toMatchSnapshot(name);
  });

  test("Nodes use existing provider", () => {
    const wrapper = mount(
      <Provider>
        <Node>x^2 + y = 3</Node>
        <Node>x^3 + y = 2</Node>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot(name);
  });
});
