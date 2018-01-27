// @flow
jest.mock("file-saver");

import FileSaver from "file-saver";
import React from "react";
import * as extraHandlers from "../../src/components/notebook-menu/extra-handlers";
import { bigDummyJSON, bigDummyCommutable } from "../../src/dummy/dummy-nb";

describe("utils", () => {
  describe("executeCells", () => {
    it("doesn't flake if not provided executeCells function", () => {
      expect(() =>
        extraHandlers.executeCells(
          null,
          bigDummyCommutable.get("cellMap"),
          bigDummyCommutable.get("cellOrder")
        )
      ).not.toThrow();
    });
    it("executes only non-code cells", () => {
      const executeCell = jest.fn();
      const cellMap = bigDummyCommutable.get("cellMap");
      const cellIds = bigDummyCommutable.get("cellOrder");
      const codeCellIds = cellIds.filter(
        id => cellMap.getIn([id, "cell_type"]) === "code"
      );
      extraHandlers.executeCells(executeCell, cellMap, cellIds);
      expect(executeCell).toHaveBeenCalledTimes(codeCellIds.size);
      codeCellIds.forEach(id => expect(executeCell).toHaveBeenCalledWith(id));
    });
  });
  describe("executeAllCellsBelow", () => {
    it("executes all cells if index isn't found", () => {
      const executeCell = jest.fn();
      const cellMap = bigDummyCommutable.get("cellMap");
      const cellIds = bigDummyCommutable.get("cellOrder");
      const codeCellIds = cellIds.filter(
        id => cellMap.getIn([id, "cell_type"]) === "code"
      );
      extraHandlers.executeAllCellsBelow(executeCell, cellMap, cellIds, null);
      expect(executeCell).toHaveBeenCalledTimes(codeCellIds.size);
      codeCellIds.forEach(id => expect(executeCell).toHaveBeenCalledWith(id));
    });
    it("executes all cells including and after index", () => {
      const executeCell = jest.fn();
      const cellMap = bigDummyCommutable.get("cellMap");
      const cellIds = bigDummyCommutable.get("cellOrder");
      const codeCellIds = cellIds.filter(
        id => cellMap.getIn([id, "cell_type"]) === "code"
      );
      const index = 2;
      const cellId = codeCellIds.get(index);
      const cellIdsToRun = codeCellIds.skip(index);
      extraHandlers.executeAllCellsBelow(executeCell, cellMap, cellIds, cellId);
      expect(executeCell).toHaveBeenCalledTimes(cellIdsToRun.size);
      cellIdsToRun.forEach(id => expect(executeCell).toHaveBeenCalledWith(id));
    });
  });
  describe("downloadNotebook", () => {
    beforeEach(() => {
      FileSaver.saveAs.mockClear();
      global.Blob = (content, options) => ({ content, options });
    });
    it("doesn't fail if notebook is null", () => {
      expect(() => extraHandlers.downloadNotebook(null, null)).not.toThrow();
    });
    it("calls FileSaver.saveAs with notebook and filename", () => {
      const filename = "/here/there/awesome.ipynb";
      const expectedData = bigDummyJSON;
      expect(FileSaver.saveAs).not.toHaveBeenCalled();
      extraHandlers.downloadNotebook(bigDummyCommutable, filename);
      expect(FileSaver.saveAs).toHaveBeenCalledTimes(1);
      const actualMockBlobResponse = FileSaver.saveAs.mock.calls[0][0];
      const actualFilename = FileSaver.saveAs.mock.calls[0][1];
      expect(actualMockBlobResponse).toEqual({
        content: [JSON.stringify(expectedData, undefined, 2)],
        options: { type: "text/json" }
      });
      expect(actualFilename).toBe("awesome.ipynb");
    });
    it("calls FileSaver.saveAs with default filename if none provided", () => {
      expect(FileSaver.saveAs).not.toHaveBeenCalled();
      extraHandlers.downloadNotebook(bigDummyCommutable, null);
      expect(FileSaver.saveAs).toHaveBeenCalledTimes(1);
      expect(FileSaver.saveAs.mock.calls[0][1]).toBe("notebook.ipynb");
    });
  });
});
