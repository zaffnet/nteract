// @flow
/* eslint-disable max-len */
import { List, Map, Set, is } from "immutable";

import * as actionTypes from "../src/actionTypes";
import * as actions from "../src/actions";
import { document as reducers } from "../src/reducers";

import {
  emptyCodeCell,
  emptyMarkdownCell,
  fromJS,
  appendCellToNotebook,
  emptyNotebook
} from "@nteract/commutable";

import { makeDocumentRecord } from "../src/state";

import {
  reduceOutputs,
  cleanCellTransient
} from "../src/reducers/core/entities/contents";

import { dummyJSON, dummyCommutable } from "../src/dummy";

const Immutable = require("immutable");

const initialDocument = new Map();
const monocellDocument = initialDocument
  .set("notebook", appendCellToNotebook(dummyCommutable, emptyCodeCell))
  .set(
    "transient",
    new Immutable.Map({ keyPathsForDisplays: new Immutable.Map() })
  );

const firstCellId = monocellDocument.getIn(["notebook", "cellOrder"]).first();

describe("reduceOutputs", () => {
  test("puts new outputs at the end by default", () => {
    const outputs = Immutable.List([
      Immutable.Map({ output_type: "stream", name: "stdout", text: "Woo" }),
      Immutable.Map({
        output_type: "error",
        ename: "well",
        evalue: "actually",
        traceback: Immutable.List()
      })
    ]);
    const newOutputs = reduceOutputs(outputs, {
      output_type: "display_data",
      data: {},
      metadata: {}
    });

    expect(JSON.stringify(newOutputs)).toEqual(
      JSON.stringify(
        Immutable.List([
          Immutable.Map({ output_type: "stream", name: "stdout", text: "Woo" }),
          Immutable.Map({
            output_type: "error",
            ename: "well",
            evalue: "actually",
            traceback: Immutable.List()
          }),
          Immutable.Map({
            output_type: "display_data",
            data: Immutable.Map(),
            metadata: Immutable.Map()
          })
        ])
      )
    );
  });

  test("handles the case of a single stream output", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" }
        ])
      )
    );
  });

  test("merges streams of text", () => {
    let outputs = Immutable.List();

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: "hello",
      output_type: "stream"
    });
    expect(
      is(
        outputs,
        Immutable.fromJS([
          { name: "stdout", text: "hello", output_type: "stream" }
        ])
      )
    ).toBe(true);

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });
    expect(
      is(
        outputs,
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" }
        ])
      )
    ).toBe(true);
  });

  test("keeps respective streams together", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" },
      { name: "stderr", text: "errors are", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" },
          { name: "stderr", text: "errors are", output_type: "stream" }
        ])
      )
    );

    const evenNewerOutputs = reduceOutputs(newOutputs, {
      name: "stderr",
      text: " informative",
      output_type: "stream"
    });
    expect(JSON.stringify(evenNewerOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" },
          {
            name: "stderr",

            text: "errors are informative",
            output_type: "stream"
          }
        ])
      )
    );
  });
});

describe("setNotebook", () => {
  test("converts a JSON notebook to our commutable notebook and puts in state", () => {
    const notebook = fromJS(dummyJSON);
    const state = reducers(initialDocument, actions.setNotebook({ notebook }));
    expect(state.getIn(["notebook", "nbformat"])).toBe(4);
  });
});

describe("setNotebookCheckpoint", () => {
  test("stores saved notebook", () => {
    const state = reducers(initialDocument, actions.saveFulfilled({}));
    expect(state.get("notebook")).toEqual(state.get("savedNotebook"));
  });
});

describe("setLanguageInfo", () => {
  test("adds the metadata fields for the kernelspec and kernel_info", () => {
    const kernelInfo = {
      name: "french",
      spec: { language: "french", display_name: "français" }
    };
    const state = reducers(
      initialDocument,
      actions.setKernelInfo({ kernelInfo })
    );
    const metadata = state.getIn(["notebook", "metadata"]);
    expect(metadata.getIn(["kernel_info", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "display_name"])).toBe("français");
  });
});

describe("focusCell", () => {
  test("should set cellFocused to the appropriate cell ID", () => {
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(monocellDocument, actions.focusCell({ id }));
    expect(state.get("cellFocused")).toBe(id);
  });
});

describe("focusNextCell", () => {
  test("should focus the next cell if not the last cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: false })
    );
    expect(state.get("cellFocused")).not.toBeNull();
  });
  test("should return same state if last cell and createCellIfUndefined is false", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: false })
    );
    expect(state.get("cellFocused")).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
  test("should create and focus a new code cell if last cell and last cell is code cell", () => {
    const originalState = monocellDocument.set(
      "notebook",
      appendCellToNotebook(dummyCommutable, emptyCodeCell)
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: true })
    );
    const newCellId = state.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type"
    ]);

    expect(state.cellFocused).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("code");
  });
  test("should create and focus a new markdown cell if last cell and last cell is markdown cell", () => {
    const originalState = monocellDocument.set(
      "notebook",
      appendCellToNotebook(dummyCommutable, emptyMarkdownCell)
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: true })
    );
    const newCellId = state.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type"
    ]);

    expect(state.cellFocused).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("markdown");
  });
});

describe("focusPreviousCell", () => {
  test("should focus the previous cell", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.focusPreviousCell({ id }));
    expect(state.get("cellFocused")).toBe(previousId);
  });
});

describe("focusCellEditor", () => {
  test("should set editorFocused to the appropriate cell ID", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();

    const action = { type: actionTypes.FOCUS_CELL_EDITOR, id };

    const state = reducers(originalState, action);
    expect(state.get("editorFocused")).toBe(id);
  });
});

describe("focusNextCellEditor", () => {
  test("should focus the editor of the next cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.focusNextCellEditor({ id }));
    expect(state.get("editorFocused")).not.toBeNull();
  });
});

describe("focusPreviousCellEditor", () => {
  test("should focus the editor of the previous cell", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.focusPreviousCellEditor({ id })
    );
    expect(state.get("editorFocused")).toBe(previousId);
  });
});

describe("toggleStickyCell", () => {
  test("should stick the cell given its ID", () => {
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set());
    const originalState = doc;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.toggleStickyCell({ id }));
    expect(state.hasIn(["stickyCells", id])).toBe(true);
  });
  test("should unstick a stuck cell given its ID", () => {
    const id = dummyCommutable.get("cellOrder").first();
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set([id]));

    const originalState = doc;
    const state = reducers(originalState, actions.toggleStickyCell({ id }));
    expect(state.hasIn(["stickyCells", id])).toBe(false);
  });
});

describe("updateExecutionCount", () => {
  test("updates the execution count by id", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.setInCell({ id, path: ["execution_count"], value: 42 })
    );
    expect(state.getIn(["notebook", "cellMap", id, "execution_count"])).toBe(
      42
    );
  });
});

describe("moveCell", () => {
  test("should swap the first and last cell appropriately", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();
    const state = reducers(
      originalState,
      actions.moveCell({ id, destinationId, above: false })
    );
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(id);
    expect(state.getIn(["notebook", "cellOrder"]).first()).toBe(destinationId);
  });
  test("should move a cell above another when asked", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();
    const state = reducers(
      originalState,
      actions.moveCell({ id, destinationId, above: true })
    );
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(destinationId);
    expect(state.getIn(["notebook", "cellOrder"]).first()).toBe(id);
  });
  test("should move a cell above another when asked", () => {
    const originalState = reducers(
      initialDocument.set("notebook", dummyCommutable),
      actions.createCellAfter({
        id: dummyCommutable.get("cellOrder").first(),
        cellType: "markdown",
        source: "# Woo\n*Yay*"
      })
    );

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);

    const state = reducers(
      originalState,
      actions.moveCell({
        id: cellOrder.get(0),
        destinationId: cellOrder.get(1),
        above: false
      })
    );
    expect(state.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(1),
      cellOrder.get(0),
      cellOrder.get(2)
    ]);

    const state2 = reducers(
      originalState,
      actions.moveCell({
        id: cellOrder.get(0),
        destinationId: cellOrder.get(1),
        above: true
      })
    );
    expect(state2.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(0),
      cellOrder.get(1),
      cellOrder.get(2)
    ]);
  });
});

describe("removeCell", () => {
  test("should remove a cell given an ID", () => {
    const originalState = monocellDocument;
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.removeCell({ id }));
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(2);
  });
});

describe("clearOutputs", () => {
  test("should clear outputs list", () => {
    const originalState = initialDocument
      .set(
        "notebook",
        appendCellToNotebook(
          dummyCommutable,
          emptyCodeCell.set("outputs", ["dummy outputs"])
        )
      )
      .set(
        "transient",
        new Immutable.Map({ keyPathsForDisplays: new Immutable.Map() })
      );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();

    const state = reducers(originalState, actions.clearOutputs({ id }));
    const outputs = state.getIn(["notebook", "cellMap", id, "outputs"]);
    expect(outputs).toBe(List.of());
  });
  test("doesn't clear outputs on markdown cells", () => {
    const notebook = appendCellToNotebook(emptyNotebook, emptyMarkdownCell);

    const originalState = makeDocumentRecord({
      notebook: notebook,
      filename: "test.ipynb"
    });

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.clearOutputs({ id }));
    const outputs = state.getIn(["notebook", "cellMap", id, "outputs"]);
    expect(outputs).toBeUndefined();
  });
});

describe("createCellAfter", () => {
  test("creates a brand new cell after the given id", () => {
    const originalState = monocellDocument;
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.createCellAfter({ cellType: "markdown", id })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    const cellID = state.getIn(["notebook", "cellOrder"]).last();
    const cell = state.getIn(["notebook", "cellMap", cellID]);
    expect(cell.get("cell_type")).toBe("markdown");
  });
});

describe("createCellBefore", () => {
  test("creates a new cell before the given id", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.createCellBefore({ cellType: "markdown", id })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(id);
  });
});

describe("mergeCellAfter", () => {
  test("merges cells appropriately", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.mergeCellAfter({ id }));
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(1);
    expect(state.getIn(["notebook", "cellOrder"]).first()).toBe(id);
  });
  test("should do nothing if merging the last cell", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.mergeCellAfter({ id }));
    expect(state).toEqual(originalState);
  });
});

describe("newCellAppend", () => {
  test("appends a new code cell at the end", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);
    const state = reducers(
      originalState,
      actions.createCellAppend({ cellType: "code" })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
});

describe("updateSource", () => {
  test("updates the source of the cell", () => {
    const originalState = initialDocument.set("notebook", dummyCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.setInCell({ id, path: ["source"], value: "This is a test" })
    );
    expect(state.getIn(["notebook", "cellMap", id, "source"])).toBe(
      "This is a test"
    );
  });
});

describe("overwriteMetadataField", () => {
  test("overwrites notebook metadata appropriately", () => {
    const originalState = monocellDocument;
    const state = reducers(
      originalState,
      actions.overwriteMetadataField({
        field: "name",
        value: "javascript"
      })
    );
    expect(state.getIn(["notebook", "metadata", "name"])).toBe("javascript");
  });
});

describe("deleteMetadata", () => {
  test("deletes notebook metadata appropriately", () => {
    const originalState = monocellDocument.setIn(
      ["notebook", "metadata", "name"],
      "johnwashere"
    );
    const action = { type: actionTypes.DELETE_METADATA_FIELD, field: "name" };
    const state = reducers(originalState, action);
    expect(state.getIn(["notebook", "metadata", "name"])).toBe(undefined);
  });
});

describe("toggleCellOutputVisibility", () => {
  test("changes the visibility on a single cell", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      cells =>
        cells.map(value => value.setIn(["metadata", "outputHidden"], false))
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.toggleCellOutputVisibility({ id })
    );
    expect(
      state.getIn(["notebook", "cellMap", id, "metadata", "outputHidden"])
    ).toBe(true);
  });
});

describe("toggleCellInputVisibility", () => {
  test("changes the input visibility on a single cell", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      cells =>
        cells.map(value => value.setIn(["metadata", "inputHidden"], false))
    );
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.toggleCellInputVisibility({
        id
      })
    );
    expect(
      state.getIn(["notebook", "cellMap", id, "metadata", "inputHidden"])
    ).toBe(true);
  });
});

describe("clearOutputs", () => {
  test("clears out cell outputs", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.clearOutputs({ id }));
    expect(state.getIn(["notebook", "cellMap", id, "outputs"]).count()).toBe(0);
  });
});

describe("updateCellStatus", () => {
  test("updates cell status", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.updateCellStatus({ id, status: "test status" })
    );
    expect(state.getIn(["transient", "cellMap", id, "status"])).toBe(
      "test status"
    );
  });
});

describe("setLanguageInfo", () => {
  test("sets the language object", () => {
    const originalState = monocellDocument;

    const action = actions.setLanguageInfo({ langInfo: "test" });

    const state = reducers(originalState, action);
    expect(state.getIn(["notebook", "metadata", "language_info"])).toBe("test");
  });
});

describe("copyCell", () => {
  test("copies a cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.getIn(["notebook", "cellMap", id]);

    const action = { type: actionTypes.COPY_CELL, id };

    const state = reducers(originalState, action);
    expect(state.getIn(["copied", "cell"])).toBe(cell);
    expect(state.getIn(["copied", "id"])).toBe(id);
  });
});

describe("cutCell", () => {
  test("cuts a cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.getIn(["notebook", "cellMap", id]);

    const action = { type: actionTypes.CUT_CELL, id };

    const state = reducers(originalState, action);
    expect(state.getIn(["copied", "cell"])).toBe(cell);
    expect(state.getIn(["copied", "id"])).toBe(id);
    expect(state.getIn(["notebook", "cellMap", id])).toBeUndefined();
  });
});

describe("pasteCell", () => {
  test("pastes a cell", () => {
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();
    const cell = monocellDocument.getIn(["notebook", "cellMap", id]);

    const originalState = monocellDocument.set(
      "copied",
      new Map({
        cell,
        id
      })
    );

    const action = { type: actionTypes.PASTE_CELL };

    const state = reducers(originalState, action);
    const copiedId = state.getIn(["notebook", "cellOrder", 1]);

    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(copiedId).not.toBe(id);
    expect(state.getIn(["notebook", "cellMap", copiedId, "source"])).toBe(
      cell.get("source")
    );
  });
});

describe("changeCellType", () => {
  test("converts code cell to markdown cell", () => {
    const originalState = monocellDocument;

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();

    const action = { type: actionTypes.CHANGE_CELL_TYPE, id, to: "markdown" };

    const state = reducers(originalState, action);

    expect(state.getIn(["notebook", "cellMap", id, "cell_type"])).toBe(
      "markdown"
    );
  });
  test("converts markdown cell to code cell", () => {
    const originalState = monocellDocument;

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = { type: actionTypes.CHANGE_CELL_TYPE, id, to: "code" };

    const state = reducers(originalState, action);

    expect(state.getIn(["notebook", "cellMap", id, "cell_type"])).toBe("code");
    expect(state.getIn(["notebook", "cellMap", id, "outputs"])).toBeDefined();
  });
  test("does nothing if cell type is same", () => {
    const originalState = monocellDocument;

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = { type: actionTypes.CHANGE_CELL_TYPE, id, to: "markdown" };

    const state = reducers(originalState, action);
    expect(state).toBe(originalState);
  });
});

describe("toggleOutputExpansion", () => {
  test("changes outputExpanded set", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      cells =>
        cells.map(value => value.setIn(["metadata", "outputExpanded"], false))
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).first();

    const action = { type: actionTypes.TOGGLE_OUTPUT_EXPANSION, id };

    const state = reducers(originalState, action);
    expect(
      state.getIn(["notebook", "cellMap", id, "metadata", "outputExpanded"])
    ).toBe(true);
  });
});
describe("appendOutput", () => {
  test("appends outputs", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const action = actions.appendOutput({
      id,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" }
      }
    });

    const state = reducers(originalState, action);
    expect(
      is(
        state.getIn(["notebook", "cellMap", id, "outputs"]),
        Immutable.fromJS([
          {
            output_type: "display_data",
            data: { "text/html": "<marquee>wee</marquee>" }
          }
        ])
      )
    ).toBe(true);

    expect(state.getIn(["transient", "keyPathsForDisplays"])).toEqual(
      Immutable.Map()
    );
  });
  test("appends output and tracks display IDs", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const action = actions.appendOutput({
      id,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" },
        transient: { display_id: "1234" }
      }
    });

    const state = reducers(originalState, action);
    expect(
      is(
        state.getIn(["notebook", "cellMap", id, "outputs"]),
        Immutable.fromJS([
          {
            output_type: "display_data",
            data: { "text/html": "<marquee>wee</marquee>" }
          }
        ])
      )
    ).toBe(true);
    expect(
      is(
        state.getIn(["transient", "keyPathsForDisplays", "1234"]),
        Immutable.fromJS([["notebook", "cellMap", id, "outputs", 0]])
      )
    ).toBe(true);
  });
});

describe("updateDisplay", () => {
  test("updates all displays which use the keypath", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const actionArray = [
      actions.appendOutput({
        id,
        output: {
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" }
        }
      }),
      actions.updateDisplay({
        content: {
          output_type: "update_display_data",
          data: { "text/html": "<marquee>WOO</marquee>" },
          transient: { display_id: "1234" }
        }
      })
    ];

    const state = actionArray.reduce(
      (s, action) => reducers(s, action),
      originalState
    );

    expect(state.getIn(["notebook", "cellMap", id, "outputs"])).toEqual(
      Immutable.fromJS([
        {
          output_type: "display_data",
          data: { "text/html": "<marquee>WOO</marquee>" },
          metadata: {}
        }
      ])
    );
  });
});

describe("cleanCellTransient", () => {
  test("cleans out keyPaths that reference a particular cell ID", () => {
    const keyPathsForDisplays = Immutable.fromJS({
      1234: [
        ["notebook", "cellMap", "0000", "outputs", 0],
        ["notebook", "cellMap", "XYZA", "outputs", 0],
        ["notebook", "cellMap", "0000", "outputs", 1]
      ],
      5678: [["notebook", "cellMap", "XYZA", "outputs", 1]]
    });
    const state = new Immutable.Map({
      transient: new Immutable.Map({
        keyPathsForDisplays
      })
    });

    expect(
      cleanCellTransient(state, "0000").getIn([
        "transient",
        "keyPathsForDisplays"
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [["notebook", "cellMap", "XYZA", "outputs", 0]],
        5678: [["notebook", "cellMap", "XYZA", "outputs", 1]]
      })
    );

    expect(
      cleanCellTransient(state, "XYZA").getIn([
        "transient",
        "keyPathsForDisplays"
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [
          ["notebook", "cellMap", "0000", "outputs", 0],
          ["notebook", "cellMap", "0000", "outputs", 1]
        ],
        5678: []
      })
    );
  });
});

describe("changeFilename", () => {
  test("returns the same originalState if filename is undefined", () => {
    const originalState = makeDocumentRecord({
      filename: "original.ipynb"
    });

    const action = { type: actionTypes.CHANGE_FILENAME };

    const state = reducers(originalState, action);
    expect(state.filename).toBe("original.ipynb");
  });
  test("sets the filename if given a valid one", () => {
    const originalState = makeDocumentRecord({
      filename: "original.ipynb"
    });

    const action = {
      type: actionTypes.CHANGE_FILENAME,
      filename: "test.ipynb"
    };

    const state = reducers(originalState, action);
    expect(state.filename).toBe("test.ipynb");
  });
});

describe("sendExecuteRequest", () => {
  test("cleans up the outputs, pagers, and status", () => {
    const notebook = appendCellToNotebook(emptyNotebook, emptyCodeCell);
    const id = notebook.get("cellOrder").first();

    const initialState = makeDocumentRecord({
      filename: "test.ipynb",
      notebook,
      cellPagers: Immutable.Map({
        // Hokey data, we're just expecting it to be cleared
        id: Immutable.List(["a", "b"])
      }),
      transient: Immutable.Map({
        cellMap: Immutable.Map({
          id: Immutable.Map({
            status: "idle"
          })
        })
      })
    });

    const state = reducers(
      initialState,
      actions.sendExecuteRequest({ id, message: {} })
    );

    expect(state.getIn(["transient", "cellMap", id, "status"])).toEqual(
      "queued"
    );

    expect(state.getIn(["cellPagers", id])).toEqual(Immutable.List());
  });
});

describe("acceptPayloadMessage", () => {
  test("processes jupyter payload message types", () => {
    const state = reducers(
      initialDocument,
      actions.acceptPayloadMessage({
        id: firstCellId,
        payload: {
          source: "page",
          data: { well: "alright" }
        }
      })
    );

    expect(state.getIn(["cellPagers", firstCellId])).toEqual(
      Immutable.List([{ well: "alright" }])
    );

    const nextState = reducers(
      state,
      actions.acceptPayloadMessage({
        id: firstCellId,
        payload: {
          source: "set_next_input",
          replace: true,
          text: "this is now the text"
        }
      })
    );

    expect(
      nextState.getIn(["notebook", "cellMap", firstCellId, "source"])
    ).toEqual("this is now the text");
  });
});
