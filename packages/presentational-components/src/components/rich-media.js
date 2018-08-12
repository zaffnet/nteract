// @flow strict

import * as React from "react";

import type { MimeBundle } from "@nteract/records";

type RichMediaProps = {
  /**
   * Big ol' [payload of mimetype -> data](http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6)
   */
  data: MimeBundle,
  /**
   * mimetype -> settings for that mimetype
   */
  metadata: {},
  /**
   * React elements that accept mimebundle data, will get passed data[mimetype]
   */
  children: React.Node
};

export class RichMedia extends React.Component<RichMediaProps, null> {
  static defaultProps = {
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

    // If we didn't find a match, render nothing
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
