// @flow strict
import produce from "immer";
import { escapeCarriageReturnSafe } from "escape-carriage";

import type { OutputType, StreamOutput } from "../outputs";

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Array<Object>} updated-outputs - Outputs + Output
 */
export function appendOutput(
  outputs: Array<OutputType>,
  output: OutputType
): Array<OutputType> {
  const last = outputs[outputs.length - 1];

  if (
    output.outputType !== "stream" ||
    !last ||
    (outputs.length > 0 && last["outputType"] !== "stream")
  ) {
    // If it's not a stream type, we just fold in the output
    return produce(outputs, draftOutputs => {
      draftOutputs.push(output);
    });
  }

  const streamOutput: StreamOutput = output;

  function appendText(text: string): string {
    if (typeof streamOutput.text === "string") {
      return escapeCarriageReturnSafe(text + streamOutput.text);
    }
    return text;
  }

  if (
    last &&
    outputs.length > 0 &&
    typeof streamOutput.name !== "undefined" &&
    last.outputType === "stream"
  ) {
    if (last.name === streamOutput.name) {
      return produce(outputs, draftOutputs => {
        const draftLength = draftOutputs.length - 1;
        if (draftOutputs[draftLength].outputType === "stream") {
          Object.assign(draftOutputs[draftLength], {
            text: appendText(draftOutputs[draftLength].text)
          });
        }
      });
    }
    const nextToLast = outputs[outputs.length - 2];
    if (
      nextToLast &&
      nextToLast.outputType === "stream" &&
      nextToLast["name"] === streamOutput.name
    ) {
      return produce(outputs, draftOutputs => {
        const draftLength = draftOutputs.length - 2;
        if (draftOutputs[draftLength].outputType === "stream") {
          Object.assign(draftOutputs[draftLength], {
            text: appendText(draftOutputs[draftLength].text)
          });
        }
      });
    }
  }
  return produce(outputs, draftOutputs => {
    draftOutputs.push(streamOutput);
  });
}
