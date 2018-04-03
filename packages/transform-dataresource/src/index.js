/* @flow */
import * as React from "react";
import VirtualizedGrid from "./virtualized-grid";
import {
  GraphOcticon as BarGraphOcticon,
  PulseOcticon as LineGraphOcticon,
  DatabaseOcticon,
  TelescopeOcticon,
  Beaker
} from "@nteract/octicons";
import {
  XYFrame,
  OrdinalFrame,
  ResponsiveOrdinalFrame,
  ResponsiveXYFrame,
  ResponsiveNetworkFrame
} from "semiotic";

import { scaleLinear } from "d3-scale";

type Props = {
  data: Object,
  metadata: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

type LineType = "line" | "stackedarea" | "bumparea" | "stackedpercent";

type State = {
  view: "line" | "bar" | "scatter" | "grid" | "network",
  selectedMetrics: Array<string>,
  selectedDimensions: Array<string>,
  networkType:
    | "None"
    | "force"
    | "dendrogram"
    | "treemap"
    | "sankey"
    | "circlepack",
  pieceType: "None" | "bar" | "point" | "swarm" | "clusterbar",
  colorValue: string,
  sizeValue: string,
  xValue: string,
  yValue: string,
  targetDimension: string,
  sourceDimension: string,
  labelValue: string,
  summaryType: "None" | "violin" | "joy" | "histogram" | "heatmap" | "boxplot",
  lineType: LineType
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

const colors = [
  "#DA752E",
  "#E5C209",
  "#1441A0",
  "#B86117",
  "#4D430C",
  "#1DB390",
  "#B3331D",
  "#088EB2",
  "#417505",
  "#E479A8",
  "#F9F39E",
  "#5782DC",
  "#EBA97B",
  "#A2AB60",
  "#B291CF",
  "#8DD2C2",
  "#E6A19F",
  "#3DC7E0",
  "#98CE5B"
];

const availableLineTypes = [
  {
    type: "line",
    label: "Line Chart"
  },
  {
    type: "stackedarea",
    label: "Stacked Area Chart"
  },
  {
    type: "stackedpercent",
    label: "Stacked Area Chart (Percent)"
  },
  {
    type: "bumparea",
    label: "Ranked Area Chart"
  }
];

const metricDimSelector = (values, selectionFunction, title) => (
  <div style={{ display: "inline-block", margin: "0 10px" }}>
    <h2>{title}</h2>
    <select onBlur={e => selectionFunction(e.target.value)}>
      {["None", ...values].map(d => (
        <option key={`selector-option-${d}`} value={d} label={d}>
          {d}
        </option>
      ))}
    </select>
  </div>
);

const semioticLineChartTransform = (data, schema, options) => {
  let lineData;

  const { timeseries, selectedMetrics, lineType } = options;

  if (!timeseries) {
    lineData = schema.fields
      .map((d, i) => {
        return {
          color: colors[i % colors.length],
          label: d.name,
          type: d.type,
          coordinates: data.map((p, q) => ({
            value: p[d.name],
            x: q,
            label: d.name,
            color: colors[i % colors.length]
          }))
        };
      })
      .filter(
        d =>
          (selectedMetrics.length === 0 &&
            (d.type === "integer" || d.type === "number")) ||
          selectedMetrics.find(p => p === d.label)
      );
  }

  return {
    lineType: lineType,
    lines: lineData,
    renderKey: (d, i) => {
      return d.coordinates ? `line-${d.label}` : `linepoint=${d.label}-${i}`;
    },
    lineStyle: d => ({ fill: d.color, stroke: d.color, fillOpacity: 0.75 }),
    pointStyle: d => {
      return {
        fill: d.color,
        fillOpacity: 0.75
      };
    },
    axes: [{ orient: "left" }, { orient: "bottom", ticks: 10 }],
    hoverAnnotation: true,
    xAccessor: "x",
    yAccessor: "value",
    showLinePoints: true,
    margin: { top: 20, right: 20, bottom: 50, left: 50 },
    legend: {
      title: "Legend",
      position: "right",
      width: 200,
      legendGroups: [
        {
          label: "",
          styleFn: d => ({ fill: d.color }),
          items: lineData
        }
      ]
    },
    tooltipContent: d => {
      return (
        <div className="tooltip-content">
          <p>{d.parentLine && d.parentLine.label}</p>
          <p>
            {d.label}: {d.value}
          </p>
          <p>X: {d.x}</p>
        </div>
      );
    }
  };
};

const semioticNetworkTransform = (data, schema, options) => {
  const {
    sourceDimension,
    targetDimension,
    networkType = "force",
    quantitative
  } = options;
  if (
    !sourceDimension ||
    sourceDimension === "none" ||
    !targetDimension ||
    targetDimension === "none"
  ) {
    return {};
  }
  const edgeHash = {};
  const networkData = [];
  data.forEach(d => {
    if (!edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]) {
      edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`] = {
        source: d[sourceDimension],
        target: d[targetDimension],
        value: 0,
        weight: 0
      };
      networkData.push(edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]);
    }
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].value +=
      d[quantitative];
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].weight += 1;
  });

  const valueMin = Math.min(...networkData.map(d => d.value));
  const valueMax = Math.max(...networkData.map(d => d.value));
  const nodeScale = scaleLinear()
    .domain([valueMin, valueMax])
    .range([2, 20]);
  return {
    edges: networkData,
    edgeType: "halfarrow",
    edgeStyle: d => ({ fill: "lightgray", stroke: "gray" }),
    nodeStyle: d => ({ fill: "lightgray", stroke: "black" }),
    nodeLabels: true,
    nodeSizeAccessor: d => d.degree,
    networkType: { type: networkType, iterations: 1000 },
    margin: { left: 100, right: 100, top: 10, bottom: 10 },
    annotationSettings: {
      layout: { type: "marginalia", orient: ["left", "right"] }
    }
  };
};

const semioticBarChartTransform = (data, schema, options) => {
  const additionalSettings = {};
  const colorHash = {};

  const {
    categorical,
    sizeValue,
    colorValue,
    quantitative,
    selectedMetrics,
    selectedDimensions
  } = options;

  const oAccessor =
    selectedDimensions.length === 0
      ? categorical
      : d => selectedDimensions.map(p => d[p]).join(",");

  const rAccessor = quantitative;

  if (sizeValue && sizeValue !== "None") {
    additionalSettings.dynamicColumnWidth = sizeValue;
  }

  if (colorValue && colorValue !== "None") {
    const uniqueValues = data.reduce(
      (p, c) =>
        (!p.find(d => d === c[colorValue]) && [...p, c[colorValue]]) || p,
      []
    );

    uniqueValues.forEach((d, i) => {
      colorHash[d] = colors[i % colors.length];
    });

    additionalSettings.legend = {
      title: "Legend",
      position: "right",
      width: 200,
      legendGroups: [
        {
          label: colorValue,
          styleFn: d => ({ fill: colorHash[d.label] }),
          items: uniqueValues.map(d => ({ label: d }))
        }
      ]
    };
  }

  return {
    type: "bar",
    data: data,
    oAccessor,
    rAccessor,
    style: d => ({ fill: colorHash[d[colorValue]] || colors[0] }),
    oPadding: 5,
    oLabel: d => <text transform="rotate(90)">{d}</text>,
    hoverAnnotation: true,
    margin: { top: 10, right: 10, bottom: 100, left: 70 },
    axis: { orient: "left", label: rAccessor },
    tooltipContent: d => {
      return (
        <div className="tooltip-content">
          {/* colorValue &&
            colorValue !== "none" && <p>{d.pieces[0][colorValue]}</p> */}
          <p>
            {typeof oAccessor === "function"
              ? oAccessor(d.pieces[0])
              : d.pieces[0][oAccessor]}
          </p>
          <p>
            {rAccessor}:{" "}
            {d.pieces.map(p => p[rAccessor]).reduce((p, c) => p + c, 0)}
          </p>
          {sizeValue &&
            sizeValue !== "none" && (
              <p>
                {d.pieces.map(p => p[sizeValue]).reduce((p, c) => p + c, 0)}
              </p>
            )}
        </div>
      );
    },
    ...additionalSettings
  };
};

const semioticScatterplotTransform = (data, schema, options) => {
  const {
    colorValue,
    sizeValue,
    labelValue,
    quantitative,
    secondQuantitative,
    height
  } = options;
  let sizeScale = e => 5;
  const colorHash = {};
  const additionalSettings = {};

  let annotations;

  if (labelValue && labelValue !== "None") {
    const topQ = [...data]
      .sort((a, b) => b[quantitative] - a[quantitative])
      .filter((d, i) => i < 3);
    const topSecondQ = [...data]
      .sort((a, b) => b[secondQuantitative] - a[secondQuantitative])
      .filter(d => topQ.indexOf(d) === -1)
      .filter((d, i) => i < 3);

    annotations = [...topQ, ...topSecondQ].map(d => ({
      type: "react-annotation",
      label: d[labelValue],
      ...d
    }));
  }

  if (sizeValue && sizeValue !== "None") {
    const dataMin = Math.min(...data.map(d => d[sizeValue]));
    const dataMax = Math.max(...data.map(d => d[sizeValue]));
    sizeScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([2, 20]);
  }
  if (colorValue && colorValue !== "None") {
    const uniqueValues = data.reduce(
      (p, c) =>
        (!p.find(d => d === c[colorValue]) && [...p, c[colorValue]]) || p,
      []
    );

    uniqueValues.forEach((d, i) => {
      colorHash[d] = colors[i % colors.length];
    });

    additionalSettings.legend = {
      title: "Legend",
      position: "right",
      width: 200,
      legendGroups: [
        {
          label: colorValue,
          styleFn: d => ({ fill: colorHash[d.label] }),
          items: uniqueValues.map(d => ({ label: d }))
        }
      ]
    };
  }
  return {
    xAccessor: quantitative,
    yAccessor: secondQuantitative,
    axes: [
      { orient: "left", ticks: 6, label: secondQuantitative },
      { orient: "bottom", ticks: 6, label: quantitative }
    ],
    points: data,
    pointStyle: d => ({
      r: sizeScale(d[sizeValue]),
      fill: colorHash[d[colorValue]] || "black",
      fillOpacity: 0.75,
      stroke: "black",
      strokeOpacity: 0.9
    }),
    hoverAnnotation: true,
    responsiveWidth: false,
    size: [height + 25, height],
    margin: { left: 75, bottom: 50, right: 20, top: 20 },
    annotations: annotations,
    annotationSettings: {
      layout: { type: "bump" }
    },
    ...additionalSettings
  };
};

const semioticSettings = {
  line: {
    Frame: ResponsiveXYFrame,
    controls: "switch between linetype",
    transformation: semioticLineChartTransform
  },
  scatter: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    transformation: semioticScatterplotTransform
  },
  bar: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    transformation: semioticBarChartTransform
  },
  network: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    transformation: semioticNetworkTransform
  }
};

/*
  contour is an option for scatterplot
  pie is a transform on bar
*/

const MetadataWarning = ({ metadata }) => {
  const warning =
    metadata && metadata.sampled ? (
      <span>
        <b>NOTE:</b> This data is sampled
      </span>
    ) : null;

  return (
    <div
      style={{
        fontFamily:
          "Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif"
      }}
    >
      <div
        style={{
          backgroundColor: "#cec",
          color: "#111",
          padding: "10px",
          paddingLeft: "20px"
        }}
      >
        This interactive data explorer is in the works.{" "}
        <a
          href="https://github.com/nteract/nteract/issues/new"
          style={{
            color: "#333"
          }}
        >
          Help us improve it!
        </a>
        <Beaker
          style={{
            color: "#111",
            verticalAlign: "center",
            textAlign: "center",
            paddingLeft: "10px"
          }}
        />
      </div>
      {warning ? (
        <div
          style={{
            backgroundColor: "#cce",
            padding: "10px",
            paddingLeft: "20px"
          }}
        >
          {warning}
        </div>
      ) : null}
    </div>
  );
};

///////////////////////////////

class DataResourceTransform extends React.Component<Props, State> {
  static MIMETYPE = "application/vnd.dataresource+json";

  static defaultProps = {
    metadata: {}
  };

  state = {
    view: "grid",
    lineType: "line",
    metric: undefined,
    dimension: undefined,
    selectedDimensions: [],
    selectedMetrics: [],
    pieceType: "bar",
    summaryType: "None",
    networkType: "force",
    sizeValue: "None",
    colorValue: "None",
    xValue: "None",
    yValue: "None",
    sourceDimension: "None",
    targetDimension: "None",
    labelValue: "None"
  };

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

  setNetwork = () => {
    this.setState({ view: "network" });
  };

  setLineType = (e: LineType) => {
    this.setState({ lineType: e });
  };

  updateDimensions = (e: string) => {
    const oldDims = this.state.selectedDimensions;
    const newDimensions =
      oldDims.indexOf(e) === -1
        ? [...oldDims, e]
        : oldDims.filter(d => d !== e);
    this.setState({ selectedDimensions: newDimensions });
  };
  updateMetrics = (e: string) => {
    const oldDims = this.state.selectedMetrics;
    const newMetrics =
      oldDims.indexOf(e) === -1
        ? [...oldDims, e]
        : oldDims.filter(d => d !== e);
    this.setState({ selectedMetrics: newMetrics });
  };

  render(): ?React$Element<any> {
    const { view } = this.state;

    console.log("this.state", this.state);

    let display = null;

    const dimensions = this.props.data.schema.fields.filter(
      d => d.type === "string"
    );
    const metrics = this.props.data.schema.fields.filter(
      d => d.type === "integer" || d.type === "number"
    );

    const categorical = dimensions[0];
    const quantitative = this.state.xValue || metrics[0].name;
    const secondQuantitative = this.state.yValue || metrics[1].name;

    if (view === "grid") {
      display = <DataResourceTransformGrid {...this.props} />;
    } else if (["line", "scatter", "bar", "network"].includes(view)) {
      const { Frame, transformation } = semioticSettings[view];
      const frameSettings = transformation(
        this.props.data.data,
        this.props.data.schema,
        {
          categorical,
          quantitative,
          secondQuantitative,
          colors: colors,
          height: this.props.height,
          lineType: this.state.lineType,
          selectedDimensions: this.state.selectedDimensions,
          selectedMetrics: this.state.selectedMetrics,
          sizeValue: this.state.sizeValue,
          colorValue: this.state.colorValue,
          labelValue: this.state.labelValue,
          pieceType: this.state.pieceType,
          summaryType: this.state.summaryType,
          sourceDimension: this.state.sourceDimension,
          targetDimension: this.state.targetDimension,
          networkType: this.state.networkType,
          timeseries: null
        }
      );

      display = (
        <div style={{ width: "calc(100% - 200px)" }}>
          <Frame
            responsiveWidth={true}
            size={[500, this.props.height]}
            {...frameSettings}
          />
          {(view === "scatter" || view === "bar" || view === "network") &&
            metricDimSelector(
              metrics.map(d => d.name),
              d => this.setState({ xValue: d }),
              view === "scatter" ? "X" : "Metric"
            )}
          {view === "scatter" &&
            metricDimSelector(
              metrics.map(d => d.name),
              d => this.setState({ yValue: d }),
              "Y"
            )}
          {(view === "scatter" || view === "bar") &&
            metricDimSelector(
              metrics.map(d => d.name),
              d => this.setState({ sizeValue: d }),
              "SIZE"
            )}
          {(view === "scatter" || view === "bar") &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => this.setState({ colorValue: d }),
              "COLOR"
            )}
          {view === "scatter" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => this.setState({ labelValue: d }),
              "LABELS"
            )}
          {view === "network" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => this.setState({ sourceDimension: d }),
              "SOURCE"
            )}
          {view === "network" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => this.setState({ targetDimension: d }),
              "TARGET"
            )}
          {view === "network" &&
            metricDimSelector(
              ["force", "dendrogram", "treemap", "circlepack", "sankey"],
              d => this.setState({ networkType: d }),
              "TYPE"
            )}
          {view === "line" && (
            <div>
              {availableLineTypes.map(d => (
                <button
                  style={{
                    marginLeft: "20px",
                    color:
                      this.state.lineType === d.type ? "lightgray" : "black"
                  }}
                  onClick={() => this.setLineType(d.type)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
          {view === "bar" && (
            <div>
              <h1>Dimensions</h1>
              {dimensions.map(d => (
                <button
                  key={`dimensions-select-${d.name}`}
                  style={{
                    marginLeft: "20px",
                    color:
                      this.state.selectedDimensions.indexOf(d.name) !== -1
                        ? "black"
                        : "lightgray"
                  }}
                  onClick={() => this.updateDimensions(d.name)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
          {view === "line" && (
            <div>
              <h1>Metrics</h1>
              {metrics.map(d => (
                <button
                  key={`metrics-select-${d.name}`}
                  style={{
                    marginLeft: "20px",
                    color:
                      this.state.selectedMetrics.indexOf(d.name) !== -1
                        ? "black"
                        : "lightgray"
                  }}
                  onClick={() => this.updateMetrics(d.name)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <style jsx>{`
            :global(.tooltip-content) {
              color: black;
              padding: 10px;
              z-index: 999999;
              min-width: 120px;
              background: white;
              border: 1px solid black;
              position: relative;
              transform: translate(calc(-50% + 7px), calc(-100% - 20px));
            }
            :global(.tooltip-content:before) {
              border-right: inherit;
              border-bottom: inherit;
              bottom: -8px;
              left: calc(50% - 15px);
              background: inherit;
              content: "";
              padding: 0px;
              transform: rotate(45deg);
              width: 15px;
              height: 15px;
              position: absolute;
              z-index: 99;
            }

            :global(.tick > path) {
              stroke: lightgray;
            }

            :global(.axis-labels) {
              fill: lightgray;
            }
            :global(.axis-baseline) {
              stroke-opacity: 0.25;
            }
            :global(circle.frame-hover) {
              fill: none;
              stroke: gray;
            }
          `}</style>
        </div>
      );
    }

    return (
      <div>
        <MetadataWarning metadata={this.props.metadata} />
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
            <IconButton onClick={this.setNetwork} message={"Network"}>
              <Beaker />
            </IconButton>
          </div>
        </div>
      </div>
    );
  }
}

/////////////////////////////

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
