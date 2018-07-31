// @flow
import React from "react";
import Ansi from "ansi-to-react";

import { demultiline } from "@nteract/records";

import type { ErrorOutput } from "@nteract/records";

type Props = {
  output: ErrorOutput
};

export const ErrorOutputComponent = ({ output }: Props) => {
  const traceback = demultiline(output.traceback);
  const classPrefix = "nteract-display-area-";

  if (!traceback) {
    return (
      <Ansi className={classPrefix + "traceback"}>{`${output.ename}: ${
        output.evalue
      }`}</Ansi>
    );
  }
  return <Ansi className={classPrefix + "traceback"}>{traceback}</Ansi>;
};
