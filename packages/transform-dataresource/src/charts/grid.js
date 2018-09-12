import * as React from "react";
import VirtualizedGrid from "../virtualized-grid";
import ReactTable from "react-table";
import ReactTableStyles from "../css/react-table";

export const DataResourceTransformGrid = ({
  data: { data, schema },
  theme,
  expanded,
  height
}) => {
  console.log("data, schema", data, schema, theme, height, expanded);
  const tableColumns = schema.fields.map(f => ({
    Header: f.name,
    accessor: f.name
  }));

  console.log("tableColumns");
  return (
    <div className="put-table-here">
      <ReactTable data={data} columns={tableColumns} />
      <style jsx>{ReactTableStyles}</style>
    </div>
  );
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
