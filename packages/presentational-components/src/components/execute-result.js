// @flow strict

import * as React from "react";

import type { MimeBundle } from "@nteract/records";

type ExecuteResultProps = {
  /**
   * The n-th result of execution
   *
   * Typically used to show what execution count the user is on. When working at
   * the `IPython` or `jupyter console` for example, it's the number between the
   * `[ ]` on the Out:
   *
   * ```
   * In [1]: 2 + 2
   * Out[1]: 4
   *
   * In [2]: "should be the 2"
   * Out[2]: 'should be the 2'
   * ```
   *
   */
  executionCount: ?number,
  /**
   * Big ol' [payload of mimetype -> data](http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6)
   */
  data: MimeBundle,
  /**
   * Grab bag of random things
   */
  metadata: {},
  /**
   * React elements that accept mimebundle data
   */
  children: React.Node
};

export class ExecuteResult extends React.Component<ExecuteResultProps, null> {
  static defaultProps = {
    executionCount: null,
    data: {},
    metadata: {}
  };

  render() {
    // We must pick only one child to render
    let chosenOne = null;

    const data = this.props.data;

    React.Children.forEach(this.props.children, child => {
      if (chosenOne) {
        // Already have a selection
        return;
      }
      if (child.props && child.props.mimetype && child.props.mimetype in data) {
        chosenOne = child;
        return;
      }
    });

    if (chosenOne === null) {
      return null;
    }

    const mimetype = chosenOne.props.mimetype;

    return React.cloneElement(chosenOne, {
      data: this.props.data[mimetype],
      metadata: this.props.metadata[mimetype]
    });
  }
}
