// @flow
import * as Immutable from "immutable";
import type { ContentRef } from "../../refs";

import type { NotebookContentRecord } from "./notebook";
import type { DirectoryContentRecord } from "./directory";
import type { DummyContentRecord } from "./dummy";

export * from "./notebook";
export * from "./directory";
export * from "./dummy";

// TODO: this will be a merger of notebook, directory, and file eventually.
export type ContentRecord =
  | NotebookContentRecord
  | DummyContentRecord
  | DirectoryContentRecord;

export type ContentsRecordProps = {
  byRef: Immutable.Map<ContentRef, ContentRecord>
};

export const makeContentsRecord: Immutable.RecordFactory<
  ContentsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
