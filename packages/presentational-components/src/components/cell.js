// @flow

import * as React from "react";

export const Cell = (props: { isSelected: boolean, children?: React.Node }) => {
  const children = props.children;
  return (
    <div className={`cell ${props.isSelected ? "focused" : ""}`}>
      <style jsx>{`
        .cell {
          position: relative;
          background: var(--theme-cell-bg, white);
          transition: all 0.1s ease-in-out;
        }

        .cell:hover {
          box-shadow: var(
            --theme-cell-shadow-hover,
            1px 1px 3px rgba(0, 0, 0, 0.12),
            -1px -1px 3px rgba(0, 0, 0, 0.12)
          );
        }

        .cell.focused {
          box-shadow: var(
            --theme-cell-shadow-focus,
            3px 3px 9px rgba(0, 0, 0, 0.12),
            -3px -3px 9px rgba(0, 0, 0, 0.12)
          );
        }

        .cell:hover :global(.prompt),
        .cell:active :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-hover, hsl(0, 0%, 94%));
          color: var(--theme-cell-prompt-fg-hover, hsl(0, 0%, 15%));
        }

        .cell:focus :global(.prompt),
        .cell.focused :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-focus, hsl(0, 0%, 90%));
          color: var(--theme-cell-prompt-fg-focus, white);
        }
      `}</style>
      {children}
    </div>
  );
};

Cell.defaultProps = {
  isSelected: false,
  children: null
};
