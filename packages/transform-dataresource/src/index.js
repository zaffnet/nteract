/* @flow */
import React from "react";
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

  renderIconButtons() {
    return [
      <IconButton onClick={this.setGrid} message={"Data Table"}>
        <DatabaseOcticon />
      </IconButton>,
      <IconButton onClick={this.setLine} message={"Line Graph"}>
        <LineGraphOcticon />
      </IconButton>,
      <IconButton onClick={this.setBar} message={"Bar Graph"}>
        <BarGraphOcticon />
      </IconButton>,
      <IconButton onClick={this.setScatter} message={"Scatter Plot"}>
        <TelescopeOcticon />
      </IconButton>
    ];
  }

  render(): ?React$Element<any> {
    const buttons = this.renderIconButtons();
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
          {buttons}
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
