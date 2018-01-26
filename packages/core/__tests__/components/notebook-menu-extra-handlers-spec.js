// @flow
import React from "react";
import * as Immutable from "immutable";
import * as extraHandlers from "../../src/components/notebook-menu/extra-handlers";

describe("utils", () => {
  describe("executeCells", () => {
    it("doesn't flake if not provided executeCells function", () => {
      expect(() =>
        extraHandlers.executeCells(null, Immutable.Map(), Immutable.List())
      ).not.toThrow();
    });
    it("executes only non-code cells", () => {
      const executeCell = jest.fn();
      const cellMap = Immutable.Map({
        a: Immutable.Map({ cell_type: "code" }),
        b: Immutable.Map({ cell_type: "cruft" }),
        c: Immutable.Map({ cell_type: "markdown" }),
        d: Immutable.Map({ cell_type: "code" })
      });
      const cellIds = Immutable.List(["a", "b", "c", "d"]);
      extraHandlers.executeCells(executeCell, cellMap, cellIds);
      expect(executeCell).toHaveBeenCalledTimes(2);
      expect(executeCell).toHaveBeenCalledWith("a");
      expect(executeCell).toHaveBeenCalledWith("d");
    });
    it("handles missing cell ids", () => {
      const executeCell = jest.fn();
      const cellMap = Immutable.Map({});
      const cellIds = Immutable.List(["a", "b", "c", "d"]);
      extraHandlers.executeCells(executeCell, cellMap, cellIds);
      expect(executeCell).not.toHaveBeenCalled();
    });
  });
  describe("executeAllCellsBelow", () => {
    it("executes all cells if index isn't found", () => {
      const executeCell = jest.fn();
      const cellMap = Immutable.Map({
        a: Immutable.Map({ cell_type: "code" }),
        b: Immutable.Map({ cell_type: "code" })
      });
      const cellIds = Immutable.List(["a", "b"]);
      extraHandlers.executeAllCellsBelow(executeCell, cellMap, cellIds, "DNE");
      expect(executeCell).toHaveBeenCalledTimes(2);
      expect(executeCell).toHaveBeenCalledWith("a");
      expect(executeCell).toHaveBeenCalledWith("b");
    });
    it("executes all cells if index isn't given", () => {
      const executeCell = jest.fn();
      const cellMap = Immutable.Map({
        a: Immutable.Map({ cell_type: "code" }),
        b: Immutable.Map({ cell_type: "code" })
      });
      const cellIds = Immutable.List(["a", "b"]);
      extraHandlers.executeAllCellsBelow(executeCell, cellMap, cellIds, null);
      expect(executeCell).toHaveBeenCalledTimes(2);
      expect(executeCell).toHaveBeenCalledWith("a");
      expect(executeCell).toHaveBeenCalledWith("b");
    });
    it("executes all cells including and after index", () => {
      const executeCell = jest.fn();
      const cellMap = Immutable.Map({
        a: Immutable.Map({ cell_type: "code" }),
        b: Immutable.Map({ cell_type: "code" }),
        c: Immutable.Map({ cell_type: "markdown" }),
        d: Immutable.Map({ cell_type: "code" })
      });
      const cellIds = Immutable.List(["a", "b", "c", "d"]);
      extraHandlers.executeAllCellsBelow(executeCell, cellMap, cellIds, "b");
      expect(executeCell).toHaveBeenCalledTimes(2);
      expect(executeCell).toHaveBeenCalledWith("b");
      expect(executeCell).toHaveBeenCalledWith("d");
    });
  });
});
