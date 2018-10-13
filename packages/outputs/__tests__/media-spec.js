import * as React from "react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import renderer from "react-test-renderer";

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

describe("<JSON />;", () => {
  const population = {
    total_population: [
      { date: "2018-10-13", population: 329499086 },
      { date: "2018-10-14", population: 329505562 }
    ]
  };

  it("renders JSON data", () => {
    const component = renderer
      .create(<Media.JSON data={population} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it("updates the theme if it changes", () => {
    const component = renderer
      .create(<Media.JSON data={population} theme={"dark"} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
