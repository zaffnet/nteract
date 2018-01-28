// @flow
jest.mock("../../src/components/notebook-menu/extra-handlers");

import React from "react";
import renderer from "react-test-renderer";
import * as Immutable from "immutable";
import * as extraHandlers from "../../src/components/notebook-menu/extra-handlers";
import { shallow, mount } from "enzyme";
import { PureNotebookMenu } from "../../src/components/notebook-menu";
import {
  MENU_ITEM_ACTIONS,
  MENUS
} from "../../src/components/notebook-menu/constants";

describe("PureNotebookMenu ", () => {
  describe("snapshots", () => {
    test("renders the default", () => {
      const component = renderer.create(<PureNotebookMenu />);
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe("shallow", () => {
    test("renders the default", () => {
      const wrapper = shallow(<PureNotebookMenu />);
      expect(wrapper).not.toBeNull();
    });
  });
  describe("mount", () => {
    test("renders the default", () => {
      const wrapper = mount(<PureNotebookMenu />);
      expect(wrapper).not.toBeNull();
    });
    test("calls appropriate handlers on click", () => {
      const props = {
        // action functions
        executeCell: jest.fn(),
        cutCell: jest.fn(),
        copyCell: jest.fn(),
        pasteCell: jest.fn(),
        createCodeCell: jest.fn(),
        createMarkdownCell: jest.fn(),
        mergeCellAfter: jest.fn(),
        setCellTypeCode: jest.fn(),
        setCellTypeMarkdown: jest.fn(),
        setTheme: jest.fn(),

        // document state (we mock out the implementation, so these are just
        // dummy variables.
        cellFocused: "fake",
        cellMap: Immutable.Map(),
        cellOrder: Immutable.List(),
        notebook: Immutable.Map(),
        filename: "fake.ipynb",

        // menu props, note that we force all menus to be open to click.
        defaultOpenKeys: Object.values(MENUS)
      };
      const wrapper = mount(<PureNotebookMenu {...props} />);

      // Test that we call executeAllCells
      const executeAllCellsItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS })
        .first();
      expect(extraHandlers.executeAllCells).not.toHaveBeenCalled();
      executeAllCellsItem.simulate("click");
      expect(extraHandlers.executeAllCells).toHaveBeenCalledTimes(1);
      expect(extraHandlers.executeAllCells).toHaveBeenCalledWith(
        props.executeCell,
        props.cellMap,
        props.cellOrder
      );

      const executeAllCellsBelowItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW })
        .first();
      expect(extraHandlers.executeAllCellsBelow).not.toHaveBeenCalled();
      executeAllCellsBelowItem.simulate("click");
      expect(extraHandlers.executeAllCellsBelow).toHaveBeenCalledTimes(1);
      expect(extraHandlers.executeAllCellsBelow).toHaveBeenCalledWith(
        props.executeCell,
        props.cellMap,
        props.cellOrder,
        props.cellFocused
      );

      const downloadNotebookItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK })
        .first();
      expect(extraHandlers.downloadNotebook).not.toHaveBeenCalled();
      downloadNotebookItem.simulate("click");
      expect(extraHandlers.downloadNotebook).toHaveBeenCalledTimes(1);
      expect(extraHandlers.downloadNotebook).toHaveBeenCalledWith(
        props.notebook,
        props.filename
      );

      const cutCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CUT_CELL })
        .first();
      expect(props.cutCell).not.toHaveBeenCalled();
      cutCellItem.simulate("click");
      expect(props.cutCell).toHaveBeenCalledTimes(1);
      expect(props.cutCell).toHaveBeenCalledWith(props.cellFocused);

      const copyCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.COPY_CELL })
        .first();
      expect(props.copyCell).not.toHaveBeenCalled();
      copyCellItem.simulate("click");
      expect(props.copyCell).toHaveBeenCalledTimes(1);
      expect(props.copyCell).toHaveBeenCalledWith(props.cellFocused);

      const pasteCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.PASTE_CELL })
        .first();
      expect(props.pasteCell).not.toHaveBeenCalled();
      pasteCellItem.simulate("click");
      expect(props.pasteCell).toHaveBeenCalledTimes(1);
      expect(props.pasteCell).toHaveBeenCalledWith();

      const mergeCellAfterItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.MERGE_CELL_AFTER })
        .first();
      expect(props.mergeCellAfter).not.toHaveBeenCalled();
      mergeCellAfterItem.simulate("click");
      expect(props.mergeCellAfter).toHaveBeenCalledTimes(1);
      expect(props.mergeCellAfter).toHaveBeenCalledWith(props.cellFocused);

      const createMarkdownCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL })
        .first();
      expect(props.createMarkdownCell).not.toHaveBeenCalled();
      createMarkdownCellItem.simulate("click");
      expect(props.createMarkdownCell).toHaveBeenCalledTimes(1);
      expect(props.createMarkdownCell).toHaveBeenCalledWith(props.cellFocused);

      const createCodeCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CREATE_CODE_CELL })
        .first();
      expect(props.createCodeCell).not.toHaveBeenCalled();
      createCodeCellItem.simulate("click");
      expect(props.createCodeCell).toHaveBeenCalledTimes(1);
      expect(props.createCodeCell).toHaveBeenCalledWith(props.cellFocused);

      const setCellTypeCodeItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE })
        .first();
      expect(props.setCellTypeCode).not.toHaveBeenCalled();
      setCellTypeCodeItem.simulate("click");
      expect(props.setCellTypeCode).toHaveBeenCalledTimes(1);
      expect(props.setCellTypeCode).toHaveBeenCalledWith(props.cellFocused);

      const setCellTypeMarkdownItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN })
        .first();
      expect(props.setCellTypeMarkdown).not.toHaveBeenCalled();
      setCellTypeMarkdownItem.simulate("click");
      expect(props.setCellTypeMarkdown).toHaveBeenCalledTimes(1);
      expect(props.setCellTypeMarkdown).toHaveBeenCalledWith(props.cellFocused);

      const setThemeLightItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_THEME_LIGHT })
        .first();
      expect(props.setTheme).not.toHaveBeenCalled();
      setThemeLightItem.simulate("click");
      expect(props.setTheme).toHaveBeenCalledTimes(1);
      expect(props.setTheme).toHaveBeenCalledWith("light");

      props.setTheme.mockClear();
      const setThemeDarkItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_THEME_DARK })
        .first();
      expect(props.setTheme).not.toHaveBeenCalled();
      setThemeDarkItem.simulate("click");
      expect(props.setTheme).toHaveBeenCalledTimes(1);
      expect(props.setTheme).toHaveBeenCalledWith("dark");
    });
  });
});
