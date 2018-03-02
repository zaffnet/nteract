// @flow
import * as Immutable from "immutable";
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
  stickyCells: Immutable.Set<any>,
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
  stickyCells: Immutable.Set(),
  editorFocused: null,
  cellFocused: null,
  copied: Immutable.Map(),
  filename: ""
});

export type DocumentRecord = Immutable.RecordOf<DocumentRecordProps>;
