/* @flow */
import React from "react";

import { MathJax } from "@nteract/markdown";

type Props = {
  data: string
};

export default class LaTeXDisplay extends React.Component<Props> {
  static MIMETYPE = "text/latex";

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  render(): ?React$Element<any> {
    return (
      <MathJax.Context input="tex">
        <MathJax.Node>{this.props.data}</MathJax.Node>
      </MathJax.Context>
    );
  }
}
