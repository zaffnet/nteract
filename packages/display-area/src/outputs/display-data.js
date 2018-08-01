// @flow
import * as React from "react";
import RichestMime from "../richest-mime";
import type { DisplayDataOutput } from "@nteract/records";

type Props = {
  displayOrder: Array<string>,
  transforms: Object,
  theme: string,
  models: Object,
  onMetadataChange?: () => void,
  output: DisplayDataOutput
};

export class DisplayDataComponent extends React.Component<Props, null> {
  static defaultProps = {
    displayOrder: [],
    transforms: {},
    theme: "",
    models: {},
    output: {}
  };
  render() {
    return (
      <RichestMime
        bundle={this.props.output.data}
        metadata={this.props.output.metadata}
        displayOrder={this.props.displayOrder}
        transforms={this.props.transforms}
        theme={this.props.theme}
        models={this.props.models}
      />
    );
  }
}
