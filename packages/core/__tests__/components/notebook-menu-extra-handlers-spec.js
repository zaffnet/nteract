// @flow
jest.mock("file-saver");

import FileSaver from "file-saver";
import React from "react";
import * as extraHandlers from "../../src/components/notebook-menu/extra-handlers";
import { bigDummyJSON, bigDummyCommutable } from "../../src/dummy/dummy-nb";

describe("extra-handlers", () => {
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
