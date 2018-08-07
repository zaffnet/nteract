import css from "styled-jsx/css";

export default css`
  :global(.tooltip-content) {
    color: black;
    padding: 10px;
    z-index: 999999;
    min-width: 120px;
    background: white;
    border: 1px solid #888;
    border-radius: 5px;
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
  :global(.tooltip-content h3) {
    margin: 0 0 10px;
  }
  :global(.tooltip-content p) {
    font-size: 14px;
  }

  :global(.tick > path) {
    stroke: lightgray;
  }

  :global(.axis-labels) {
    fill: #aaa;
    font-size: 14px;
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
