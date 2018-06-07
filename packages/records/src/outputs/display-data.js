// @flow

import * as Immutable from "immutable";
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

export type DisplayDataType = "display_data";

export const DISPLAYDATA = "display_data";

// In-memory version
type DisplayDataOutput = {
  outputType: DisplayDataType,
  data: common.MimeBundle,
  metadata: JSONObject
};

// On disk
export type NbformatDisplayDataOutput = {
  output_type: DisplayDataType,
  data: common.MimeBundle,
  metadata: JSONObject
};

type DisplayDataMessage = {
  header: {
    msg_type: DisplayDataType
  },
  content: {
    data: common.MimeBundle,
    metadata: JSONObject
  }
};

export type DisplayDataOutputRecord = Immutable.RecordOf<DisplayDataOutput>;

// NOTE: No export, as the values here should get overridden by an exact version
//       passed into makeDisplayDataOutputRecord
const displayDataOutputRecordMaker: Immutable.RecordFactory<
  DisplayDataOutput
> = Immutable.Record({
  outputType: DISPLAYDATA,
  data: {},
  metadata: {}
});

export function makeDisplayDataOutputRecord(
  displayDataOutput: DisplayDataOutput
): DisplayDataOutputRecord {
  return displayDataOutputRecordMaker(displayDataOutput);
}

export function displayDataRecordFromNbformat(
  s: NbformatDisplayDataOutput
): DisplayDataOutputRecord {
  return makeDisplayDataOutputRecord(
    Object.assign(
      {},
      {
        outputType: s.output_type,
        data: s.data,
        metadata: s.metadata
      }
      //common.sanitize(s)
    )
  );
}

export function displayDataRecordFromMessage(
  msg: DisplayDataMessage
): DisplayDataOutputRecord {
  return makeDisplayDataOutputRecord({
    outputType: DISPLAYDATA,
    data: msg.content.data,
    metadata: msg.content.metadata
  });
}
