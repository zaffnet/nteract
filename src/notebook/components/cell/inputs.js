// @flow
import React from 'react';

type Props = {
  executionCount: any,
  running: boolean,
};

export default class Inputs extends React.PureComponent {
  props: Props;

  render(): ?React.Element<any> {
    const { executionCount, running } = this.props;
    const count = !executionCount ? ' ' : executionCount;
    const input = running ? '*' : count;
    return (
      <div className="prompt">
        [{input}]
      </div>
    );
  }
}
