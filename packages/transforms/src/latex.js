/* @flow */
import React from "react";
import PropTypes from "prop-types";

import MathJax from "@nteract/mathjax";

type Props = {
  data: string
};

export const LaTeXDisplay = (props: Props) => {
  return <MathJax.Node>{props.data}</MathJax.Node>;
};

LaTeXDisplay.MIMETYPE = "text/latex";

export default LaTeXDisplay;
