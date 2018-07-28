/* @flow */

import {
  ResponsiveOrdinalFrame,
  ResponsiveXYFrame,
  ResponsiveNetworkFrame
} from "semiotic";

import ParallelCoordinatesController from "./ParallelCoordinatesController";

import { semioticLineChart } from "./charts/line";
import { semioticNetwork } from "./charts/network";
import { semioticHierarchicalChart } from "./charts/hierarchical";
import { semioticBarChart } from "./charts/bar";
import { semioticScatterplot, semioticHexbin } from "./charts/xyplot";
import { semioticSummaryChart } from "./charts/summary";

const semioticParallelCoordinates = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  return {
    data,
    schema,
    options
  };
};

export const semioticSettings = {
  line: {
    Frame: ResponsiveXYFrame,
    controls: "switch between linetype",
    chartGenerator: semioticLineChart
  },
  scatter: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticScatterplot
  },
  hexbin: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticHexbin
  },
  bar: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticBarChart
  },
  summary: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticSummaryChart
  },
  network: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticNetwork
  },
  hierarchy: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticHierarchicalChart
  },
  parallel: {
    Frame: ParallelCoordinatesController,
    controls: "switch between modes",
    chartGenerator: semioticParallelCoordinates
  }
};
