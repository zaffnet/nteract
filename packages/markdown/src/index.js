// @flow
import React from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "./mathjax";
import RemarkMathPlugin from "remark-math";

const MarkdownRender = (props: ReactMarkdown.ReactMarkdownProps) => {
  const newProps = {
    ...props,
    plugins: [RemarkMathPlugin],
    renderers: {
      ...props.renderers,
      math: (props: { value: string }) => (
        <MathJax.Node>{props.value}</MathJax.Node>
      ),
      inlineMath: (props: { value: string }) => (
        <MathJax.Node inline>{props.value}</MathJax.Node>
      )
    }
  };
  return (
    <MathJax.Context input="tex">
      <ReactMarkdown {...newProps} />
    </MathJax.Context>
  );
};

export default MarkdownRender;
