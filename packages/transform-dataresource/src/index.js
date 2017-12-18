/* @flow */
import React from "react";
import VirtualizedGrid from "./virtualized-grid";
import PlotlyTransform from "@nteract/transform-plotly";
// import VirtualizedTable from './virtualized-table';

type Props = {
  data: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

type State = {
  showGrid: boolean,
  showPlot: boolean
};

const DataResourceTransformGrid = ({
  data: { data, schema },
  theme,
  expanded,
  height
}) => {
  return (
    <VirtualizedGrid
      data={data}
      schema={schema}
      theme={theme}
      expanded={expanded}
      height={height}
      // style={{ marginRight: "10px" }}
    />
  );
};

const DataResourceTransformPlot = ({ data: { data, schema } }) => {
  const figure = { data: [] };
  schema.fields.forEach(({ name }, i) => {
    figure.data[i] = { name, y: [], type: "bar" };
  });
  data.forEach((row, j) => {
    schema.fields.forEach(({ name }, i) => {
      figure.data[i].y[j] = row[name];
    });
  });
  return <PlotlyTransform data={figure} />;
};

class DataResourceTransform extends React.Component<Props, State> {
  static MIMETYPE = "application/vnd.dataresource+json";

  state = { showGrid: false, showPlot: true };

  shouldComponentUpdate(): boolean {
    return true;
  }

  toggleGrid = () => {
    this.setState(state => ({ showGrid: !state.showGrid }));
  };

  togglePlot = () => {
    this.setState(state => ({ showPlot: !state.showPlot }));
  };

  render(): ?React$Element<any> {
    const { showGrid, showPlot } = this.state;
    return (
      <div>
        {showGrid ? <DataResourceTransformGrid {...this.props} /> : null}
        {showPlot ? <DataResourceTransformPlot {...this.props} /> : null}
        <button onClick={this.toggleGrid}>{`${
          showGrid ? "Hide" : "Show"
        } Grid`}</button>
        <button onClick={this.togglePlot}>{`${
          showPlot ? "Hide" : "Show"
        } Plot`}</button>
      </div>
    );
  }
}

export default DataResourceTransform;
