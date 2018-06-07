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

export type ExecuteResultType = "execute_result";
export type ExecutionCount = number | null;

export const EXECUTERESULT = "execute_result";

// In-memory version
type ExecuteResultOutput = {
  outputType: ExecuteResultType,
  executionCount: ExecutionCount,
  data: common.MimeBundle,
  metadata: JSONObject
};

// On disk
export type NbformatExecuteResultOutput = {
  output_type: ExecuteResultType,
  execution_count: ExecutionCount,
  data: common.MimeBundle,
  metadata: JSONObject
};

type ExecuteResultMessage = {
  header: {
    msg_type: ExecuteResultType
  },
  content: {
    execution_count: number,
    data: common.MimeBundle,
    metadata: JSONObject
  }
};

export type ExecuteResultOutputRecord = Immutable.RecordOf<ExecuteResultOutput>;

// NOTE: No export, as the values here should get overridden by an exact version
//       passed into makeExecuteResultOutputRecord
const executeResultOutputRecordMaker: Immutable.RecordFactory<
  ExecuteResultOutput
> = Immutable.Record({
  outputType: EXECUTERESULT,
  executionCount: null,
  data: {},
  metadata: {}
});

export function makeExecuteResultOutputRecord(
  executeResultOutput: ExecuteResultOutput
): ExecuteResultOutputRecord {
  return executeResultOutputRecordMaker(executeResultOutput);
}

export function executeResultRecordFromNbformat(
  s: NbformatExecuteResultOutput
): ExecuteResultOutputRecord {
  return makeExecuteResultOutputRecord(
    Object.assign(
      {},
      {
        outputType: s.output_type,
        executionCount: s.execution_count,
        data: s.data,
        metadata: s.metadata
      }
    )
  );
}

export function executeResultRecordFromMessage(
  msg: ExecuteResultMessage
): ExecuteResultOutputRecord {
  return makeExecuteResultOutputRecord({
    outputType: EXECUTERESULT,
    executionCount: msg.content.execution_count,
    data: msg.content.data,
    metadata: msg.content.metadata
  });
}
