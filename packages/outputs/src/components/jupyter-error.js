// @flow strict
import * as React from "react";
import Ansi from "ansi-to-react";

import type { ErrorOutput } from "@nteract/records";
type Props = ErrorOutput;

export const JupyterError = (props: Props) => {
  const { ename, evalue, traceback } = props;

  if (!Array.isArray(traceback) || !traceback.length) {
    return (
      <Ansi className="nteract-display-area-traceback">{`${ename}: ${evalue}`}</Ansi>
    );
  }

  return (
    <Ansi className="nteract-display-area-traceback">
      {traceback.join("\n")}
    </Ansi>
  );
};

JupyterError.defaultProps = {
  outputType: "error",
  ename: "",
  evalue: "",
  traceback: []
};
