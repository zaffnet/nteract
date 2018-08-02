import css from "styled-jsx/css";

export default css`
  :global(.tooltip-content) {
    color: black;
    padding: 10px;
    z-index: 999999;
    min-width: 120px;
    background: white;
    border: 1px solid black;
    position: relative;
    transform: translate(calc(-50% + 7px), calc(0% + 9px));
  }
  :global(.tooltip-content:before) {
    border-left: inherit;
    border-top: inherit;
    top: -8px;
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
  :global(.rect) {
    stroke: green;
    stroke-width: 5px;
    stroke-opacity: 0.5;
  }
  :global(rect.selection) {
    opacity: 0.5;
  }
`;
