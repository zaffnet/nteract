// @flow
import FileSaver from "file-saver";
import type { ImmutableNotebook } from "@nteract/commutable";
import * as commutable from "@nteract/commutable";

// Adding a level of indirection here to make it trivial to mock these out in
// tests to ensure they're getting called as we expect. It also prevents the
// NotebookMenu component from bloating too much.

const DEFAULT_NOTEBOOK_FILENAME = "notebook.ipynb";

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
