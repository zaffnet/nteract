// @flow

import * as stream from "./stream";
import * as unrecognized from "./unrecognized";

export * from "./stream";

type NbformatOutput = stream.NbformatStreamOutput;
type OutputRecord = stream.StreamOutputRecord;

/**
 * Turn any output that was in nbformat into a record
 */
export function outputFromNbformat(output: NbformatOutput): OutputRecord {
  switch (output.output_type) {
    case stream.STREAM:
      return stream.streamRecordFromNbformat(output);
    default:
      // $FlowAllowFeatureDetection: At runtime, allow fallback
      return unrecognized.unrecognizedRecordFromNbformat(output);
  }
}
