// @flow

// Unrecognized output from a future minor-revision to the notebook format.

import * as Immutable from "immutable";

// In-memory version
type UnrecognizedOutput = {
  outputType: string,
  /* The raw output, for writing back to disk properly */
  raw: Immutable.Map<any, any>
};

// On disk
export type NbformatUnrecognizedOutput = {
  output_type: string // Technically, not one of "execute_result", "display_data", "stream", or "error"
};

export type UnrecognizedOutputRecord = Immutable.RecordOf<UnrecognizedOutput>;

const unrecognizedOutputRecordMaker: Immutable.RecordFactory<
  UnrecognizedOutput
> = Immutable.Record({
  outputType: "unrecognized",
  // This must get overridden below
  raw: Immutable.Map()
});

export function makeUnrecognizedOutputRecord(
  unrecognizedOutput: UnrecognizedOutput
): UnrecognizedOutputRecord {
  return unrecognizedOutputRecordMaker(unrecognizedOutput);
}

export function unrecognizedRecordFromNbformat(
  s: NbformatUnrecognizedOutput
): UnrecognizedOutputRecord {
  return makeUnrecognizedOutputRecord({
    outputType: s.output_type,
    // ⚠️ This has the potential of being mutated within since we're only turning it into a top level Immutable.Map
    raw: Immutable.Map(s)
  });
}
