// @flow
import React from "react";
import Ansi from "ansi-to-react";

import { transforms, displayOrder } from "@nteract/transforms";
import { demultiline } from "@nteract/records";

import RichestMime from "./richest-mime";
import {
  ErrorOutputComponent,
  StreamOutputComponent,
  ExecuteResultOutputComponent
} from "./outputs";

import type { OutputType } from "@nteract/records";

type Props = {
  displayOrder: Array<string>,
  output: OutputType,
  transforms: Object,
  theme: string,
  models: Object
};

const classPrefix = "nteract-display-area-";

export default class Output extends React.Component<Props, null> {
  static defaultProps = {
    models: {},
    theme: "light",
    transforms,
    displayOrder
  };

  shouldComponentUpdate(nextProps: Props) {
    return (
      // NOTE: this only does a shallow comparison that mostly only works
      //       well for Immutable Outputs
      nextProps.output !== this.props.output ||
      nextProps.displayOrder !== this.props.displayOrder ||
      nextProps.transforms !== this.props.transforms ||
      nextProps.theme !== this.props.theme ||
      nextProps.models !== this.props.models
    );
  }

  render() {
    let output: OutputType = this.props.output;
    let models = this.props.models;

    // TODO: Incorporate the new output record types into both commutable and the react components that use them

    switch (output.outputType) {
      case "execute_result":
      // We can defer to display data here, the cell number will be handled
      // separately. For reference, it is output.execution_count
      // The execution_count belongs in the component above if
      // this is a code cell

      // falls through
      case "display_data": {
        const bundle = output.data;
        const metadata = output.metadata;
        <ExecuteResultOutputComponent
          data={bundle}
          metadata={metadata}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          theme={this.props.theme}
          models={models}
        />;
      }
      case "stream": {
        <StreamOutputComponent output={output} />;
      }
      case "error": {
        <ErrorOutputComponent output={output} />;
      }
      default:
        return null;
    }
  }
}
