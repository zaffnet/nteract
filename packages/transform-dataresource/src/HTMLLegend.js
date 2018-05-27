/* @flow */
import * as React from "react";

type HTMLLegendProps = {
  values: Array<string>,
  colorHash: Object,
  valueHash: Object
};

const HTMLLegend = ({ values, colorHash, valueHash }: HTMLLegendProps) => (
  <div style={{ marginTop: "20px" }}>
    {(values.length > 18
      ? [...values.filter((d, i) => i < 18), "Other"]
      : values
    ).map((v, vi) => (
      <span
        style={{ display: "inline-block", minWidth: "80px", margin: "5px" }}
        key={`legend-item-${vi}`}
      >
        <span
          style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            marginRight: "5px",
            borderRadius: "20px",
            marginBottom: "-5px",
            background: colorHash[v]
          }}
        />
        {v}
        {(valueHash[v] && valueHash[v] > 1 && `(${valueHash[v]})`) || ""}
      </span>
    ))}
  </div>
);

export default HTMLLegend;
