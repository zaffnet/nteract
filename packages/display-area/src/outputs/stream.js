// @flow
import React from "react";
import Ansi from "ansi-to-react";

import { demultiline } from "@nteract/records";

import type { StreamOutput } from "@nteract/records";

type Props = {
  output: StreamOutput
};

export const StreamOutputComponent = ({ output }: Props) => {
  const text = demultiline(output.text);
  const name = output.name;
  const classPrefix = "nteract-display-area-";

  switch (name) {
    case "stdout":
    case "stderr":
      return <Ansi className={classPrefix + name}>{text}</Ansi>;
    default:
      return null;
  }
};
