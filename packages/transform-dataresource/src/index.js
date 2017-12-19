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

const viewTypes = {
  LINE: "line",
  BAR: "bar",
  SCATTER: "scatter",
  GRID: "grid"
};

const viewTypeToPlotlyTraceProps = {
  [viewTypes.LINE]: {},
  [viewTypes.BAR]: { type: "bar" },
  [viewTypes.SCATTER]: { mode: "markers" }
};

const plotViewTypes = Object.keys(viewTypeToPlotlyTraceProps);

const DataResourceTransformPlot = ({
  data: { data, schema },
  type: givenType
}) => {
  const figure = { data: [] };
  const traceProps = viewTypeToPlotlyTraceProps[givenType];
  schema.fields.forEach(({ name }, i) => {
    figure.data[i] = { name, y: [], ...traceProps };
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

  state = { view: viewTypes.GRID };

  shouldComponentUpdate(): boolean {
    return true;
  }

  setGrid = () => {
    this.setState({ view: viewTypes.GRID });
  };

  setLine = () => {
    this.setState({ view: viewTypes.LINE });
  };

  setBar = () => {
    this.setState({ view: viewTypes.BAR });
  };

  setScatter = () => {
    this.setState({ view: viewTypes.SCATTER });
  };

  render(): ?React$Element<any> {
    const { view } = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexFlow: "row nowrap",
          width: "100%",
          height: this.props.height
        }}
      >
        <div
          style={{
            flex: "1"
          }}
        >
          {view === viewTypes.GRID ? (
            <DataResourceTransformGrid {...this.props} />
          ) : null}
          {plotViewTypes.includes(view) ? (
            <DataResourceTransformPlot {...this.props} type={view} />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexFlow: "column nowrap"
          }}
        >
          <button onClick={this.setGrid}>Grid</button>
          <button onClick={this.setLine}>Lines</button>
          <button onClick={this.setBar}>Bar</button>
          <button onClick={this.setScatter}>Scatter</button>
        </div>
      </div>
    );
  }
}

export default DataResourceTransform;
