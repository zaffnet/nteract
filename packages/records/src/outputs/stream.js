// @flow

import produce from "immer";
import * as common from "../common";

/**
 * Let this declare the way for well typed records for outputs
 *
 * General organization is:
 *
 *   - Declare the in-memory type
 *   - Declare the nbformat type (exactly matching nbformat.v4.schema.json)
 *   - Create a "record maker", which we _don't_ export, followed by the real `makeXRecord` function that enforces set values
 *   - Write a way to go from nbformat to these records
 *   - Write a way to go from message spec to these records
 *
 */

export type StreamName = "stdout" | "stderr";

export const STDOUT = "stdout";
export const STDERR = "stderr";

export type StreamType = "stream";

export const STREAM = "stream";

// In-memory version
type StreamOutput = {
  outputType: StreamType,
  name: StreamName,
  text: string
};

// On disk
export type NbformatStreamOutput = {
  output_type: StreamType,
  name: StreamName,
  text: common.MultilineString
};

type StreamMessage = {
  header: {
    msg_type: StreamType
  },
  content: {
    name: StreamName,
    text: string
  }
};

export type StreamOutputRecord = Immutable.RecordOf<StreamOutput>;

// NOTE: No export, as the values here should get overridden by an exact version
//       passed into makeStreamOutputRecord

export const makeStreamOutputRecord: Function = (streamOutput: Object) => {
  const defaultStreamOutput = {
    outputType: STREAM,
    name: STDOUT,
    text: ""
  };
  // do I need produce here? Or just freeze?
  return produce(defaultStreamOutput, draft =>
    Object.assign(draft, streamOutput)
  );
};

export function streamRecordFromNbformat(
  s: NbformatStreamOutput
): StreamOutputRecord {
  return makeStreamOutputRecord({
    outputType: s.output_type,
    name: s.name,
    text: common.demultiline(s.text)
  });
}

export function streamRecordFromMessage(
  msg: StreamMessage
): StreamOutputRecord {
  return makeStreamOutputRecord({
    outputType: STREAM,
    name: msg.content.name,
    text: msg.content.text
  });
}
