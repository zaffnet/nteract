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

export type ErrorType = "error" | "pyerr";

export const ERROR = "error";

// In-memory version
type ErrorOutput = {
  outputType: ErrorType,
  ename: string,
  evalue: string,
  traceback: Iterable<string>
};

// On disk
export type NbformatErrorOutput = {
  output_type: ErrorType,
  ename: string,
  evalue: string,
  traceback: Iterable<string>
};

type ErrorMessage = {
  header: {
    msg_type: ErrorType
  },
  content: {
    ename: string,
    evalue: string,
    traceback: Iterable<string>
  }
};

export type ErrorOutputRecord = Immutable.RecordOf<ErrorOutput>;

// NOTE: No export, as the values here should get overridden by an exact version
//       passed into makeErrorOutputRecord
const errorOutputRecordMaker: Immutable.RecordFactory<
  ErrorOutput
> = Immutable.Record({
  outputType: ERROR,
  ename: "",
  evalue: "",
  traceback: []
});

export function makeErrorOutputRecord(
  errorOutput: ErrorOutput
): ErrorOutputRecord {
  return errorOutputRecordMaker(errorOutput);
}

export function errorRecordFromNbformat(
  s: NbformatErrorOutput
): ErrorOutputRecord {
  return makeErrorOutputRecord(
    Object.assign(
      {},
      {
        outputType: s.output_type,
        ename: s.ename,
        evalue: s.evalue,
        traceback: s.traceback
      }
    )
  );
}

export function errorRecordFromMessage(msg: ErrorMessage): ErrorOutputRecord {
  return makeErrorOutputRecord({
    outputType: ERROR,
    ename: msg.content.ename,
    evalue: msg.content.evalue,
    traceback: msg.content.traceback
  });
}
