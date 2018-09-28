import React from "react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import * as Media from "../src/components/media";

describe("HTML", () => {
  it("renders direct HTML", () => {
    const component = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    expect(toJson(component)).toMatchSnapshot();
  });
  it("updates the underlying HTML when data changes", () => {
    const component = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    component.setProps({ data: "<b>squirrels are pretty great, too</b>" });
    expect(toJson(component)).toMatchSnapshot();
  });
});
