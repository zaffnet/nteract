// @flow
import * as React from "react";

/**
 * Generate what text goes inside the prompt based on the props to the prompt
 */
export function promptText(props: PromptProps): string {
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
  queued: boolean,
  blank: boolean
};

export class Prompt extends React.Component<PromptProps, null> {
  static defaultProps = {
    counter: null,
    running: false,
    queued: false,
    blank: false
  };

  render() {
    return (
      <React.Fragment>
        <div className="prompt">
          {this.props.blank ? null : promptText(this.props)}
        </div>
        <style jsx>{`
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
        `}</style>
      </React.Fragment>
    );
  }
}

export const PromptBuffer = () => <Prompt blank />;
