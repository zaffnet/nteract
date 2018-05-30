// @flow

import * as React from "react";
import css from "styled-jsx/css";

const promptStyle = css`
  .prompt {
    font-family: monospace;
    font-size: 12px;
    line-height: 22px;

    width: var(--prompt-width, 50px);
    padding: 9px 0;

    text-align: center;

    color: var(--theme-cell-prompt-fg, black);
    background-color: var(--theme-cell-prompt-bg, #fafafa);
  }
`;

// Totally fake component for consistency with indents of the editor area

export function promptText(props: PromptProps) {
  if (props.running) {
    return "[*]";
  }
  if (props.queued) {
    return "[…]";
  }
  if (typeof props.counter === "number") {
    return `[${props.counter}]`;
  }
  return "[ ]";
}

type PromptProps = {
  counter: number | null,
  running: boolean,
  queued: boolean
};

export class Prompt extends React.Component<PromptProps, null> {
  static defaultProps = {
    counter: null,
    running: false,
    queued: false
  };

  render() {
    return (
      <React.Fragment>
        <div className="prompt">{promptText(this.props)}</div>
        <style jsx>{promptStyle}</style>
      </React.Fragment>
    );
  }
}

export class PromptBuffer extends React.Component<any, null> {
  render() {
    return (
      <React.Fragment>
        <div className="prompt" />
        <style jsx>{promptStyle}</style>
      </React.Fragment>
    );
  }
}
