// @flow

import * as stream from "./stream";
import * as displayData from "./display-data";
import * as executeResult from "./execute-result";
import * as error from "./error";
import * as unrecognized from "./unrecognized";

export * from "./stream";
export * from "./display-data";
export * from "./execute-result";
export * from "./error";

type NbformatOutput =
  | stream.NbformatStreamOutput
  | displayData.NbformatDisplayDataOutput
  | executeResult.NbformatExecuteResultOutput
  | error.NbformatErrorOutput;
type OutputRecord =
  | stream.StreamOutputRecord
  | displayData.DisplayDataOutputRecord
  | executeResult.ExecuteResultOutputRecord
  | error.ErrorOutputRecord;

/**
 * Turn any output that was in nbformat into a record
 */
export function outputFromNbformat(output: NbformatOutput): OutputRecord {
  switch (output.output_type) {
    case stream.STREAM:
      return stream.streamRecordFromNbformat(output);
    case displayData.DISPLAYDATA:
      return displayData.displayDataRecordFromNbformat(output);
    case executeResult.EXECUTERESULT:
      return executeResult.executeResultRecordFromNbformat(output);
    case error.ERROR:
      return error.errorRecordFromNbformat(output);
    default:
      // $FlowAllowFeatureDetection: At runtime, allow fallback
      return unrecognized.unrecognizedRecordFromNbformat(output);
  }
}
