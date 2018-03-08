import Immutable from "immutable";
import { remote } from "electron";

import { from } from "rxjs/observable/from";
import { of } from "rxjs/observable/of";

import * as nativeWindow from "../../src/notebook/native-window";
import { state as stateModule } from "@nteract/core";

const path = require("path");

describe("tildify", () => {
  test("returns an empty string if given no path", () => {
    expect(nativeWindow.tildify()).toBe("");
  });
  test("replaces the user directory with ~", () => {
    const fixture = path.join(remote.app.getPath("home"), "test-notebooks");
    const result = nativeWindow.tildify(fixture);
    if (process.platform === "win32") {
      expect(result).toBe(fixture);
    } else {
      expect(result).toContain("~");
    }
  });
});

describe("setTitleFromAttributes", () => {
  test("sets the window title", () => {
    // Set up our "Electron window"
    const win = {
      setRepresentedFilename: jest.fn(),
      setDocumentEdited: jest.fn(),
      setTitle: jest.fn()
    };

    remote.getCurrentWindow = jest.fn();
    remote.getCurrentWindow.mockReturnValue(win);

    const titleObject = {
      fullpath: "/tmp/test.ipynb",
      kernelStatus: "busy",
      modified: true
    };
    nativeWindow.setTitleFromAttributes(titleObject);

    expect(win.setTitle).toBeCalled();
  });
});

describe("createTitleFeed", () => {
  test("creates an observable that updates title attributes for modified notebook", async function() {
    const kernelRef = stateModule.createKernelRef();
    const currentContentRef = stateModule.createContentRef();

    const notebook = new Immutable.Map().setIn(
      ["metadata", "kernelspec", "display_name"],
      "python3000"
    );
    const state = {
      core: stateModule.makeStateRecord({
        kernelRef,
        currentContentRef,
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              // $FlowFixMe: This really is a content ref, Flow can't handle typing it though
              [currentContentRef]: stateModule.makeNotebookContentRecord({
                path: "titled.ipynb"
              })
            })
          }),
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              // $FlowFixMe: This really is a kernel ref, Flow can't handle typing it though
              [kernelRef]: stateModule.makeRemoteKernelRecord({
                status: "not connected"
              })
            })
          })
        })
      }),
      document: stateModule.makeDocumentRecord({
        notebook,
        filename: "titled.ipynb"
      }),
      app: stateModule.makeAppRecord()
    };

    const state$ = of(state);

    const attributes = await nativeWindow.createTitleFeed(state$).toPromise();
    expect(attributes).toEqual({
      modified: false,
      fullpath: "titled.ipynb",
      kernelStatus: "not connected"
    });
  });
});
