// @flow
import * as React from "react";

type CellsProps = {
  children: React.ChildrenArray<any>
};

export const Cells = (props: CellsProps) => {
  return (
    <div className="cells">
      <style jsx>{`
        .cells > :global(*) {
          margin: 20px;
        }

        .cells {
          font-family: "Source Sans Pro", Helvetica Neue, Helvetica, Arial,
            sans-serif;
          font-size: 16px;
          background-color: var(--theme-app-bg);
          color: var(--theme-app-fg);

          padding-bottom: 10px;
        }
      `}</style>
      {props.children}
    </div>
  );
};

Cells.defaultProps = {
  children: []
};
