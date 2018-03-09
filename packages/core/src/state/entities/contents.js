// @flow
import * as Immutable from "immutable";
import type { ContentRef } from "../refs";
import { emptyNotebook } from "@nteract/commutable";

export type DocumentRecordProps = {
  // TODO: This _needs_ to become a Record
  notebook: Immutable.Map<string, any>,
  savedNotebook: Immutable.Map<string, any>,
  filename: ?string,
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
  notebook: emptyNotebook,
  savedNotebook: emptyNotebook,
  transient: Immutable.Map({
    keyPathsForDisplays: Immutable.Map()
  }),
  cellPagers: Immutable.Map(),
  editorFocused: null,
  cellFocused: null,
  copied: Immutable.Map(),
  filename: ""
});

export type DocumentRecord = Immutable.RecordOf<DocumentRecordProps>;

export type NotebookContentRecordProps = {
  created: ?Date,
  format: "json",
  lastSaved: ?Date,
  model: ?DocumentRecord,
  name: ?string,
  path: ?string,
  type: "notebook",
  writable: boolean
};

export const makeNotebookContentRecord: Immutable.RecordFactory<
  NotebookContentRecordProps
> = Immutable.Record({
  created: null,
  format: "json",
  lastSaved: null,
  model: makeDocumentRecord(),
  name: null,
  path: "",
  type: "notebook",
  writable: true
});

// TODO: this will be a merger of notebook, directory, and file eventually.
export type ContentRecordProps = {
  created: ?Date,
  format: null | "json",
  lastSaved: ?Date,
  mimetype: ?string,
  model: DocumentRecord | Immutable.Map<*, *>,
  name: ?string,
  path: ?string,
  type: "notebook",
  writable: boolean
};

export const makeContentRecord: Immutable.RecordFactory<
  ContentRecordProps
> = Immutable.Record({
  created: null,
  format: null,
  lastSaved: null,
  mimetype: null,
  model: Immutable.Map(),
  name: null,
  path: ".",
  type: "notebook",
  writable: true
});

export type ContentsRecordProps = {
  byRef: Immutable.Map<ContentRef, Immutable.RecordOf<ContentRecordProps>>
};

export const makeContentsRecord: Immutable.RecordFactory<
  ContentsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
