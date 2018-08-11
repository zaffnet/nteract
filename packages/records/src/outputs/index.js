// @flow strict

import type { JupyterMessage } from "@nteract/messaging";

import type {
  NbformatDisplayDataOutput,
  DisplayDataOutput
} from "./display-data";

import type { NbformatStreamOutput, StreamOutput } from "./stream";
import type { NbformatErrorOutput, ErrorOutput } from "./error";

import * as executeResult from "./execute-result";
import * as unrecognized from "./unrecognized";

import { displayData } from "./display-data";
import { streamOutput } from "./stream";
import { errorOutput } from "./error";

export * from "./execute-result";

export type NbformatOutput =
  | NbformatStreamOutput
  | NbformatDisplayDataOutput
  | executeResult.NbformatExecuteResultOutput
  | NbformatErrorOutput;
export type OutputType =
  | StreamOutput
  | DisplayDataOutput
  | executeResult.ExecuteResultOutput
  | ErrorOutput;

/**
 * Turn any output that was in nbformat into a record
 */
export function outputFromNbformat(output: NbformatOutput): OutputType {
  switch (output.output_type) {
    case streamOutput.type:
      return streamOutput.fromNbformat(output);
    case displayData.type:
      return displayData.fromNbformat(output);
    case executeResult.EXECUTE_RESULT:
      return executeResult.executeResultRecordFromNbformat(output);
    case errorOutput.type:
      return errorOutput.fromNbformat(output);
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
    case streamOutput.type:
      return streamOutput.fromJupyterMessage(msg);
    case displayData.type:
      return displayData.fromJupyterMessage(msg);
    case executeResult.EXECUTE_RESULT:
      return executeResult.executeResultRecordFromMessage(msg);
    case errorOutput.type:
      return errorOutput.fromJupyterMessage(msg);
    default:
      return unrecognized.makeUnrecognizedOutputRecord();
  }
}
