import React from "react";

import { mount } from "enzyme";
import Toolbar from "../../src/components/toolbar";
import toJSON from "enzyme-to-json";

describe("Toolbar View", () => {
  test("should be able to render a toolbar", () => {
    const toolbar = mount(<Toolbar />);
    expect(toJSON(toolbar)).toMatchSnapshot();
    toolbar.find(".toggle-menu").simulate("click");
    expect(toJSON(toolbar)).toMatchSnapshot();
  });
  test("clearOutputs can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(<Toolbar type="code" clearOutputs={dummyFunc} />);
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".clearOutput").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleCellInputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type="code" toggleCellInputVisibility={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".inputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleCellOutputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type="code" toggleCellOutputVisibility={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".outputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleOutputExpaned can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type="code" toggleOutputExpansion={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".outputExpanded").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("changeCellType can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(<Toolbar type="code" changeCellType={dummyFunc} />);
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".changeType").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(<Toolbar type={"markdown"} />);
    toolbar.find(".toggle-menu").simulate("click");
    expect(toolbar.text()).toContain("Convert to Code Cell");
  });
  test('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(<Toolbar type="code" />);
    toolbar.find(".toggle-menu").simulate("click");
    expect(toolbar.text()).toContain("Convert to Markdown Cell");
  });
});
