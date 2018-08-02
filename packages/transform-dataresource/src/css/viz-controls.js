import css from "styled-jsx/css";

export default css`
  .wrapper {
    display: flex;
    justify-content: left;
  }
  .control-wrapper {
    margin-right: 20px;
  }
  h2 {
    text-transform: capitalize;
  }
  select {
    height: 30px;
  }
  .button-text {
    margin: 0 20px 10px 0;
    -webkit-appearance: none;
    padding: 5px 15px;
    background: white;
    border: 1px solid #888;
    border-radius: 3px;
    cursor: pointer;
  }
  .button-text.selected {
    background: #1d8bf1;
    border-color: #1d8bf1;
    color: white;
  }
`;
