// @flow
import * as Immutable from "immutable";

import { emptyNotebook } from "@nteract/commutable";

export type DocumentRecordProps = {
  type: "notebook",
  // TODO: This _needs_ to become a Record
  notebook: Immutable.Map<string, any>,
  savedNotebook: Immutable.Map<string, any>,
  transient: Immutable.Map<string, any>, // has the keypaths for updating displays
  // transient should be more fully typed (be a record itself)
  // right now it's keypaths and then it looks like it's able to handle any per
  // cell transient data that will be deleted when the kernel is restarted
  cellPagers: any,
  editorFocused: any,
  cellFocused: any,
  copied: Immutable.Map<any, any>
};
export const makeDocumentRecord: Immutable.RecordFactory<
  DocumentRecordProps
> = Immutable.Record({
  type: "notebook",
  notebook: emptyNotebook,
  savedNotebook: emptyNotebook,
  transient: Immutable.Map({
    keyPathsForDisplays: Immutable.Map()
  }),
  cellPagers: Immutable.Map(),
  editorFocused: null,
  cellFocused: null,
  copied: Immutable.Map()
});
export type DocumentRecord = Immutable.RecordOf<DocumentRecordProps>;

export type NotebookContentRecordProps = {
  mimetype: ?string,
  created: ?Date,
  format: "json",
  lastSaved: ?Date,
  model: DocumentRecord,
  filepath: string,
  type: "notebook",
  writable: boolean
};

export const makeNotebookContentRecord: Immutable.RecordFactory<
  NotebookContentRecordProps
> = Immutable.Record({
  mimetype: null,
  created: null,
  format: "json",
  lastSaved: null,
  model: makeDocumentRecord(),
  filepath: "",
  type: "notebook",
  writable: true
});

export type NotebookContentRecord = Immutable.RecordOf<
  NotebookContentRecordProps
>;
