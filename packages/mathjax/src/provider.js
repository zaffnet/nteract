// @flow strict
/* global MathJax */

import * as React from "react";
import loadScript from "./load-script";

import MathJaxContext, {
  type MathJaxObject,
  type MathJaxContextValue
} from "./context.js";

// MathJax expected to be a global and may be undefined
declare var MathJax: ?MathJaxObject;

declare type onLoad = () => void;
type Props = {
  src: ?string,
  children: React.Node,
  didFinishTypeset: ?() => void,
  // Provide a way to override how we load MathJax and callback to the onLoad
  // For Hydrogen, for instance we can set
  //
  //  loader={(onLoad) => loadMathJax(document, onLoad)}
  //
  onLoad: ?onLoad,
  loader: ?(cb: onLoad) => void,
  input: "ascii" | "tex",
  delay: number,
  options: ?*,
  loading: React.Node,
  noGate: boolean,
  onError: (err: Error) => void
};

type State = MathJaxContextValue;

/**
 * MathJax Provider
 */
class Provider extends React.Component<Props, State> {
  static defaultProps = {
    src:
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    input: "tex",
    didFinishTypeset: null,
    loader: null,
    delay: 0,
    options: {},
    loading: null,
    noGate: false,
    onLoad: null,
    onError: (err: Error) => {
      console.error(err);
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      MathJax: undefined,
      // TODO: Ensure state gets updated when the input prop changes
      input: this.props.input,
      hasProviderAbove: true
    };
  }

  componentDidMount() {
    const src = this.props.src;

    if (src == null) {
      return this.onLoad();
    }

    if (!this.props.loader) {
      loadScript(src, this.onLoad);
    } else {
      this.props.loader(this.onLoad);
    }
  }

  onLoad = () => {
    if (!MathJax || !MathJax.Hub) {
      this.props.onError(
        new Error("MathJax not really loaded even though onLoad called")
      );
      return;
    }

    const options = this.props.options;

    MathJax.Hub.Config(options);

    MathJax.Hub.Register.StartupHook("End", () => {
      if (!MathJax) {
        this.props.onError(
          new Error("MathJax became undefined in the middle of processing")
        );
        return;
      }
      MathJax.Hub.processSectionDelay = this.props.delay;

      if (this.props.didFinishTypeset) {
        this.props.didFinishTypeset();
      }
    });

    MathJax.Hub.Register.MessageHook("Math Processing Error", message => {
      if (this.props.onError) {
        this.props.onError(new Error(message));
      }
    });

    if (this.props.onLoad) {
      this.props.onLoad();
    }

    this.setState({
      MathJax
    });
  };

  render() {
    return (
      <MathJaxContext.Provider value={this.state}>
        {this.props.children}
      </MathJaxContext.Provider>
    );
  }
}

export default Provider;
