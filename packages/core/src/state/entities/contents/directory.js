// @flow

import * as Immutable from "immutable";

import type { ContentRef } from "../../refs";

export type DirectoryModelRecordProps = {
  type: "directory",
  listing: Immutable.Set<ContentRef>
};
export const makeDirectoryModel: Immutable.RecordFactory<
  DirectoryModelRecordProps
> = Immutable.Record({
  type: "directory",
  listing: Immutable.Set()
});
export type DirectoryModelRecord = Immutable.RecordOf<
  DirectoryModelRecordProps
>;

export type DirectoryContentRecordProps = {
  type: "directory",
  created: ?Date,
  format: "json",
  lastSaved: null,
  filepath: string,
  model: DirectoryModelRecord
};
export const makeDirectoryContentRecord: Immutable.RecordFactory<
  DirectoryContentRecordProps
> = Immutable.Record({
  type: "directory",
  created: null,
  format: "json",
  lastSaved: null,
  filepath: "",
  model: makeDirectoryModel()
});
export type DirectoryContentRecord = Immutable.RecordOf<
  DirectoryContentRecordProps
>;
