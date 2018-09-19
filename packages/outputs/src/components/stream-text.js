// @flow

import * as React from "react";
import Ansi from "ansi-to-react";

import type { StreamOutput } from "@nteract/records";

type Props = {
  output: StreamOutput,
  outputType: "stream"
};

const StreamText = (props: Props) => {
  const { text, name } = props.output;

  return <Ansi className={`"nteract-display-area-${name}`}>{text}</Ansi>;
};

StreamText.defaultProps = {
  outputType: "stream"
};

export default StreamText;
