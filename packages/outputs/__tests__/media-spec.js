import React from "react";
import { mount } from "enzyme";

import * as Media from "../src/components/media";

describe("HTML", () => {
  it("renders direct HTML", () => {
    const component = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    expect(component.html()).toEqual("<div><b>cats are best</b></div>");
  });
  it("correctly chooses to update with data changing", () => {
    const wrapper = mount(<Media.HTML data={"<b>cats are best</b>"} />);

    const component = wrapper.instance();
    expect(
      component.shouldComponentUpdate({ data: "<b>cats are best</b>" })
    ).toBeFalsy();
    expect(
      component.shouldComponentUpdate({
        data: "<b>squirrels are pretty great, too</b>"
      })
    ).toBeTruthy();
  });
  it("updates the underlying HTML when data changes", () => {
    const wrapper = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    expect(wrapper.html()).toEqual("<div><b>cats are best</b></div>");

    wrapper.setProps({ data: "<b>squirrels are pretty great, too</b>" });

    expect(wrapper.html()).toEqual(
      "<div><b>squirrels are pretty great, too</b></div>"
    );
  });
});
