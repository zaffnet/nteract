import { unlinkObservable, createSymlinkObservable } from "./..";

import { toArray } from "rxjs/operators";

jest.mock("fs");
const fs = require("fs");

describe("unlinkObservable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("errors on unlink issue", async function(done) {
    expect.assertions(3);
    // File exists so we try to unlink it
    fs.existsSync.mockImplementation(() => true);
    // Unlink fails for some reason (permissions, etc.)
    fs.unlink.mockImplementation((path, callback) =>
      callback({ message: "forced failure" })
    );
    try {
      await unlinkObservable("path").toPromise();
      // Should not pass through
      done.fail();
    } catch (err) {
      expect(err.message).toBe("forced failure");
    }
    expect(fs.existsSync).toBeCalledWith("path");
    expect(fs.unlink).toBeCalled();
    done();
  });
  it("completes and calls fs.existsSync, fs.unlink", async function() {
    expect.assertions(2);
    fs.existsSync.mockImplementation(() => true);
    fs.unlink.mockImplementation((path, callback) => callback());

    await unlinkObservable("path2").toPromise();

    expect(fs.existsSync).toBeCalledWith("path2");
    expect(fs.unlink).toBeCalled();
  });
});
