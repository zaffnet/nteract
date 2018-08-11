// @flow strict

import * as React from "react";

import type { ExecuteResultOutput } from "@nteract/records";

type ExecuteResultProps = {} & ExecuteResultOutput;

export class ExecuteResult extends React.Component<ExecuteResultProps, null> {
  render() {
    return <div />;
  }
}
