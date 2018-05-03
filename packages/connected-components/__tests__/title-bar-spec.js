// @flow
import * as React from "react";

import { shallow } from "enzyme";

import toJSON from "enzyme-to-json";

import { TitleBar } from "../src/title-bar";
import { Logo } from "../src/title-bar/logos";

describe("title-bar", () => {
  test("should be able to render", () => {
    const titleBar = shallow(<TitleBar />);
    expect(toJSON(titleBar)).toMatchSnapshot();

    const titleBar2 = shallow(<TitleBar theme="dark" title="great" />);
    expect(toJSON(titleBar2)).toMatchSnapshot();
  });
});

describe("logos", () => {
  test("should be able to render", () => {
    const logo = shallow(<Logo />);
    expect(toJSON(logo)).toMatchSnapshot();

    logo.setProps({ theme: "dark" });
    expect(toJSON(logo)).toMatchSnapshot();
  });
});
