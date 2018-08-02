/* @flow */
import * as React from "react";

export const semioticNetwork = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const { networkType = "force", chart, colors } = options;
  const { dim1: sourceDimension, dim2: targetDimension, dim3, metric1 } = chart;

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
  const nodeHash = {};
  const nodes = [];

  data.forEach(d => {
    const nodeIDs = [d[sourceDimension], d[targetDimension]];
    nodeIDs.forEach(nodeID => {
      if (!nodeHash[nodeID]) {
        nodeHash[nodeID] = { id: nodeID };
        nodes.push(nodeHash[nodeID]);
      }
    });
    Object.keys(d).forEach(key => {
      nodeHash[d[sourceDimension]][key] = d[key];
    });
    if (!edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]) {
      edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`] = {
        source: nodeHash[d[sourceDimension]],
        target: nodeHash[d[targetDimension]],
        value: 0,
        weight: 0
      };
      networkData.push(edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]);
    }
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].value +=
      d[metric1] || 1;
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].weight += 1;
  });

  const colorHash = {};
  nodes.forEach(node => {
    if (!colorHash[node[dim3]])
      colorHash[node.id] =
        colors[Object.keys(colorHash).length % colors.length];
  });

  networkData.forEach(d => {
    d.weight = Math.min(10, d.weight);
  });

  console.log("nodes", nodes);

  return {
    edges: networkData,
    nodes: nodes,
    edgeType: "halfarrow",
    edgeStyle: (d: Object) => ({
      fill: (dim3 !== "none" && colorHash[d.source[dim3]]) || "gray",
      stroke: (dim3 !== "none" && colorHash[d.source[dim3]]) || "gray",
      strokeOpacity: 0.5
    }),
    nodeStyle: (d: Object) => ({
      fill: (dim3 !== "none" && colorHash[d[dim3]]) || "gray",
      stroke: (dim3 !== "none" && colorHash[d[dim3]]) || "gray",
      strokeOpacity: 0.5
    }),
    nodeSizeAccessor: (d: Object) => d.degree,
    networkType: {
      type: networkType,
      iterations: 1000
    },
    hoverAnnotation: true,
    tooltipContent: (d: Object) => {
      return (
        <div className="tooltip-content">
          <h2>{d.id}</h2>
          <p>Links: {d.degree}</p>
          {d.value && <p>Value: {d.value}</p>}
        </div>
      );
    },
    margin: { left: 100, right: 100, top: 10, bottom: 10 }
  };
};
