import React from "react";
import Immutable from "immutable";

import { mount } from "enzyme";

import Cell from "../../src/providers/cell";

import { dummyStore } from "../../src/dummy";

import { emptyCodeCell, emptyMarkdownCell } from "@nteract/commutable";

describe("Cell", () => {
  test("should be able to render a markdown cell", () => {
    const selectCell = jest.fn();
    const focusCellEditor = jest.fn();

    // TODO: This test is not _really_ testing anything other than exercising
    //       the code. We need more real tests here.
    // TODO: jest snapshots!
    const cell = mount(
      <Cell
        cell={emptyMarkdownCell}
        selectCell={selectCell}
        focusCellEditor={focusCellEditor}
      />,
      {
        // TODO: Tear out the context & store once the provider based Toolbar is no more
        context: { store: dummyStore() }
      }
    );
    expect(cell).not.toBeNull();

    cell.update();

    cell.setProps({ cellFocused: "1", id: "1" });
  });
  test("should be able to render a code cell", () => {
    const cell = mount(<Cell cell={emptyCodeCell} />, {
      context: { store: dummyStore() }
    });
    expect(cell).not.toBeNull();
  });
  test("dispatches cell actions", () => {
    const selectCell = jest.fn();
    const focusCellEditor = jest.fn();

    const cell = mount(
      <Cell
        cell={emptyMarkdownCell}
        selectCell={selectCell}
        focusCellEditor={focusCellEditor}
      />,
      { context: { store: dummyStore() } }
    );
  });
});
