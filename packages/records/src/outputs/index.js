// @flow

import * as stream from "./stream";
import * as displayData from "./display-data";
import * as unrecognized from "./unrecognized";

export * from "./stream";
export * from "./display-data";

type NbformatOutput =
  | stream.NbformatStreamOutput
  | displayData.NbformatDisplayDataOutput;
type OutputRecord =
  | stream.StreamOutputRecord
  | displayData.DisplayDataOutputRecord;

/**
 * Turn any output that was in nbformat into a record
 */
export function outputFromNbformat(output: NbformatOutput): OutputRecord {
  switch (output.output_type) {
    case stream.STREAM:
      return stream.streamRecordFromNbformat(output);
    case displayData.DISPLAYDATA:
      return displayData.displayDataRecordFromNbformat(output);
    default:
      // $FlowAllowFeatureDetection: At runtime, allow fallback
      return unrecognized.unrecognizedRecordFromNbformat(output);
  }
}
