// @flow

import * as React from "react";
import PropTypes from "prop-types";

class Text extends React.Component<*, *> {
  el: ?HTMLElement;

  componentDidMount() {
    this.refreshMathJax();
  }

  componentDidUpdate() {
    this.refreshMathJax();
  }

  refreshMathJax() {
    const { MathJax } = this.context;
    if (!MathJax) {
      throw Error(
        "Could not find MathJax while attempting typeset! Probably MathJax script hasn't been loaded or MathJax.Context is not in the hierarchy"
      );
    }

    MathJax.Hub.Queue(MathJax.Hub.Typeset(this.el, this.props.onRender));
  }

  render() {
    return (
      <pre
        key={this.props.text}
        ref={el => {
          this.el = el;
        }}
      >
        {this.props.text}
      </pre>
    );
  }
}

Text.contextTypes = {
  MathJax: PropTypes.object
};

export default Text;
