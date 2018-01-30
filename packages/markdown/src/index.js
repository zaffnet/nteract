// @flow
import React from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "./mathjax";
import RemarkMathPlugin from "remark-math";

const math = (props: { value: string }) => (
  <MathJax.Node>{props.value}</MathJax.Node>
);

const inlineMath = (props: { value: string }) => (
  <MathJax.Node inline>{props.value}</MathJax.Node>
);

const MarkdownRender = (props: ReactMarkdown.ReactMarkdownProps) => {
  const newProps = {
    // https://github.com/rexxars/react-markdown#options
    ...props,
    plugins: [RemarkMathPlugin],
    renderers: {
      ...props.renderers,
      math,
      inlineMath
    }
  };
  return (
    <MathJax.Context input="tex">
      <ReactMarkdown {...newProps} />
    </MathJax.Context>
  );
};

export { MathJax };

export default MarkdownRender;
