// @flow

// Someday in the future, the notebook format or the message spec might get a new output type. We need to make sure that our
// frontends are able to have a known fallback when an output type isn't known.

// In-memory version
export type UnrecognizedOutput = any;

// On disk
export type NbformatUnrecognizedOutput = {
  output_type: string // Technically, not one of "execute_result", "display_data", "stream", or "error"
};

export function makeUnrecognizedOutputRecord(): UnrecognizedOutput {
  const defaultUnrecognizedOutput = {
    outputType: "unrecognized"
  };

  return defaultUnrecognizedOutput;
}

export function unrecognizedRecordFromNbformat(): UnrecognizedOutput {
  return makeUnrecognizedOutputRecord();
}
