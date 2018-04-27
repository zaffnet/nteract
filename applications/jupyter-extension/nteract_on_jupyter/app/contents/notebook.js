// @flow

import * as React from "react";

import { NotebookApp, NotebookMenu, state as stateModule } from "@nteract/core";

import {
  displayOrder as defaultDisplayOrder,
  transforms as defaultTransforms
} from "@nteract/transforms";

type State = {
  transforms: typeof defaultTransforms,
  displayOrder: typeof defaultDisplayOrder
};

type Props = {
  contentRef: stateModule.ContentRef
};

export default class Notebook extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayOrder: defaultDisplayOrder,
      transforms: defaultTransforms
    };
  }

  loadTransforms() {
    /**
     * Goal: load transforms dynamically to allow expensive transforms to come after the app.
     *
     * I now wish that all our transforms exposed a top level `register`
     * function that I can pass in the `displayOrder` and `transforms`.
     *
     * That or they need to supply a list of their own transforms with mimetypes and all that
     * Goes to show what it looks like when I punt on extensibility
     */
    /**
    const modules = await Promise.all([
      import("@nteract/transform-plotly"),
      import("@nteract/transform-model-debug"),
      import("@nteract/transform-dataresource"),
      import("@nteract/transform-vega"),
      import("@nteract/transform-geojson")
    ]);

    console.log(modules);
    **/
  }

  componentDidMount() {
    this.loadTransforms();
  }

  render() {
    return (
      <React.Fragment>
        <NotebookMenu />
        <NotebookApp
          contentRef={this.props.contentRef}
          displayOrder={this.state.displayOrder}
          transforms={this.state.transforms}
        />
      </React.Fragment>
    );
  }
}
