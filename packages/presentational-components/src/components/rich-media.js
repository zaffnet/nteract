// @flow strict

import * as React from "react";

import type { MediaBundle } from "@nteract/records";

type RichMediaProps = {
  /**
   * Object of media type → data
   *
   * E.g.
   *
   * ```js
   * {
   *   "text/plain": "raw text",
   * }
   * ```
   *
   * See [Jupyter message spec](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data)
   * for more detail.
   *
   */
  data: MediaBundle,
  /**
   * custom settings, typically keyed by media type
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

    // Find the first child element that matches something in this.props.data
    React.Children.forEach(this.props.children, child => {
      if (chosenOne) {
        // Already have a selection
        return;
      }
      if (
        child.props &&
        child.props.mediaType &&
        child.props.mediaType in data
      ) {
        chosenOne = child;
        return;
      }
    });

    // If we didn't find a match, render nothing
    if (chosenOne === null) {
      return null;
    }

    const mediaType = chosenOne.props.mediaType;

    return React.cloneElement(chosenOne, {
      data: this.props.data[mediaType],
      metadata: this.props.metadata[mediaType]
    });
  }
}
