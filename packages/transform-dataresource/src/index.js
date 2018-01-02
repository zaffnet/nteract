/* @flow */
import * as React from "react";
import VirtualizedGrid from "./virtualized-grid";
import PlotlyTransform from "@nteract/transform-plotly";
import {
  GraphOcticon as BarGraphOcticon,
  PulseOcticon as LineGraphOcticon,
  DatabaseOcticon,
  TelescopeOcticon
} from "@nteract/octicons";

type Props = {
  data: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

type State = {
  view: "line" | "bar" | "scatter" | "grid"
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

type LINE_VIEW = "line";
type BAR_VIEW = "bar";
type SCATTER_VIEW = "scatter";
type GRID_VIEW = "grid";

const viewTypeToPlotlyTraceProps = {
  grid: {}, // avoid our lookup
  line: {},
  bar: { type: "bar" },
  scatter: { mode: "markers" }
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

  state = { view: "grid" };

  shouldComponentUpdate(): boolean {
    return true;
  }

  setGrid = () => {
    this.setState({ view: "grid" });
  };

  setLine = () => {
    this.setState({ view: "line" });
  };

  setBar = () => {
    this.setState({ view: "bar" });
  };

  setScatter = () => {
    this.setState({ view: "scatter" });
  };

  render(): ?React$Element<any> {
    const { view } = this.state;

    let display = null;

    if (view === "grid") {
      display = <DataResourceTransformGrid {...this.props} />;
    } else if (plotViewTypes.includes(view)) {
      display = <DataResourceTransformPlot {...this.props} type={view} />;
    }

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
          {display}
        </div>
        <div
          style={{
            display: "flex",
            flexFlow: "column nowrap"
          }}
        >
          <IconButton onClick={this.setGrid} message={"Data Table"}>
            <DatabaseOcticon />
          </IconButton>
          <IconButton onClick={this.setLine} message={"Line Graph"}>
            <LineGraphOcticon />
          </IconButton>
          <IconButton onClick={this.setBar} message={"Bar Graph"}>
            <BarGraphOcticon />
          </IconButton>
          <IconButton onClick={this.setScatter} message={"Scatter Plot"}>
            <TelescopeOcticon />
          </IconButton>
        </div>
      </div>
    );
  }
}

type IconButtonProps = {
  message: string,
  onClick: () => void,
  children?: React.Node
};

export class IconButton extends React.Component<IconButtonProps> {
  render() {
    const { message, onClick, children } = this.props;
    return (
      <button
        onClick={onClick}
        key={message}
        title={message}
        style={{
          width: "32px",
          height: "32px"
        }}
      >
        {children}
      </button>
    );
  }
}

export default DataResourceTransform;
