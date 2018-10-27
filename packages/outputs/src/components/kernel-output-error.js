// @flow strict
import * as React from "react";
// $FlowFixMe
import Ansi from "ansi-to-react";

type Props = {
  /**
   *  The name of the exception. This value is returned by the kernel.
   */
  ename: string,
  /**
   * The value of the exception. This value is returned by the kernel.
   */
  evalue: string,
  /**
   * The output type passed to the Output component. This should be `error`
   * if you would like to render a KernelOutputError component.
   */
  outputType: string,
  /**
   * The tracebook of the exception. This value is returned by the kernel.
   */
  traceback: Array<string>
};

export const KernelOutputError = (props: Props) => {
  const { ename, evalue, traceback } = props;

  if (!Array.isArray(traceback) || !traceback.length) {
    return <Ansi>{`${ename}: ${evalue}`}</Ansi>;
  }

  return <Ansi>{traceback.join("\n")}</Ansi>;
};

KernelOutputError.defaultProps = {
  outputType: "error",
  ename: "",
  evalue: "",
  traceback: []
};
