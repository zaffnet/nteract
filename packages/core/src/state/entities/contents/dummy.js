// @flow

import * as Immutable from "immutable";

export type EmptyModelRecordProps = {
  type: "unknown"
};

export const makeEmptyModel: Immutable.RecordFactory<
  EmptyModelRecordProps
> = Immutable.Record({
  type: "unknown"
});
export type EmptyModelRecord = Immutable.RecordOf<EmptyModelRecordProps>;

export type DummyContentRecordProps = {
  type: "dummy",
  assumedType: "unknown" | "directory" | "notebook" | "file",
  lastSaved: null,
  filepath: string,
  model: EmptyModelRecord
};
export const makeDummyContentRecord: Immutable.RecordFactory<
  DummyContentRecordProps
> = Immutable.Record({
  type: "dummy",
  assumedType: "unknown",
  lastSaved: null,
  filepath: "",
  model: makeEmptyModel()
});
export type DummyContentRecord = Immutable.RecordOf<DummyContentRecordProps>;
