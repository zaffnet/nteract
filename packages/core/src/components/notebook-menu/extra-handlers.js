// @flow
import * as Immutable from "immutable";
import FileSaver from "file-saver";
import type { ImmutableNotebook, Notebook } from "@nteract/commutable";
import * as commutable from "@nteract/commutable";

// Adding a level of indirection here to make it trivial to mock these out in
// tests to ensure they're getting called as we expect. It also prevents the
// NotebookMenu component from bloating too much.

// TODO: these exist in commutable/types. We should use export/use those.
type FocusedCellId = ?string;
type CellIds = Immutable.List<string>;
type CellMap = Immutable.Map<string, *>;
type CellIdFn = ?(string) => void;

const DEFAULT_NOTEBOOK_FILENAME = "notebook.ipynb";

export const executeCells = (
  executeCell: CellIdFn,
  cellMap: CellMap,
  cellIds: CellIds
) => {
  if (executeCell) {
    cellIds
      .filter(id => cellMap.getIn([id, "cell_type"]) === "code")
      .forEach((cellId: string) => {
        // $FlowFixMe: Not sure why Flow thinks the fn can be null here.
        executeCell(cellId);
      });
  }
};

export const executeAllCells = (
  executeCell: CellIdFn,
  cellMap: CellMap,
  cellIds: CellIds
) => executeCells(executeCell, cellMap, cellIds);

export const executeAllCellsBelow = (
  executeCell: CellIdFn,
  cellMap: CellMap,
  cellIds: CellIds,
  focusedCellId: FocusedCellId
) => {
  const skipToIndex = focusedCellId ? cellIds.indexOf(focusedCellId) : -1;
  if (~skipToIndex) {
    executeCells(executeCell, cellMap, cellIds.skip(skipToIndex));
  } else {
    executeCells(executeCell, cellMap, cellIds);
  }
};

export const downloadNotebook = (
  immutableNotebook: ?ImmutableNotebook,
  path: ?string
) => {
  if (immutableNotebook) {
    const notebook = commutable.toJS(immutableNotebook);
    const filename = (path || DEFAULT_NOTEBOOK_FILENAME).split("/").pop();
    const data = commutable.stringifyNotebook(notebook);
    const blob = new Blob([data], { type: "text/json" });
    FileSaver.saveAs(blob, filename);
  }
};
