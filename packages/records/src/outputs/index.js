// @flow

import type { JupyterMessage } from "@nteract/messaging";

import * as stream from "./stream";
import * as displayData from "./display-data";
import * as executeResult from "./execute-result";
import * as error from "./error";
import * as unrecognized from "./unrecognized";

export * from "./stream";
export * from "./display-data";
export * from "./execute-result";
export * from "./error";

export type NbformatOutput =
  | stream.NbformatStreamOutput
  | displayData.NbformatDisplayDataOutput
  | executeResult.NbformatExecuteResultOutput
  | error.NbformatErrorOutput;
export type OutputType =
  | stream.StreamOutput
  | displayData.DisplayDataOutput
  | executeResult.ExecuteResultOutput
  | error.ErrorOutput;

/**
 * Turn any output that was in nbformat into a record
 */
export function outputFromNbformat(output: NbformatOutput): OutputType {
  switch (output.output_type) {
    case stream.STREAM:
      return stream.streamRecordFromNbformat(output);
    case displayData.DISPLAYDATA:
      return displayData.displayDataRecordFromNbformat(output);
    case executeResult.EXECUTE_RESULT:
      return executeResult.executeResultRecordFromNbformat(output);
    case error.ERROR:
      return error.errorRecordFromNbformat(output);
    default:
      // TODO: Properly type unrecognized output messages
      return unrecognized.unrecognizedRecordFromNbformat();
  }
}

/**
 * Turn any output that was in JupyterMessage into a record
 */
export function outputFromMessage(msg: JupyterMessage<*, *>): OutputType {
  const msg_type = msg.header.msg_type;
  switch (msg_type) {
    case stream.STREAM:
      return stream.streamRecordFromMessage(msg);
    case displayData.DISPLAYDATA:
      return displayData.displayDataRecordFromMessage(msg);
    case executeResult.EXECUTE_RESULT:
      return executeResult.executeResultRecordFromMessage(msg);
    case error.ERROR:
      return error.errorRecordFromMessage(msg);
    default:
      return unrecognized.makeUnrecognizedOutputRecord();
  }
}
