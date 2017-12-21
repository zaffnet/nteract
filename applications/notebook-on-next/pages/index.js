import React from "react";
import { Router } from "../routes";

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = { gistid: "" };
  }

  handleChange = e => {
    this.setState({ gistid: e.target.value });
  };

  handleKeydown = e => {
    if (e.key == "Enter") {
      this.handleConfirm();
    }
  };

  handleConfirm = () => {
    if (this.state.gistid) {
      Router.pushRoute("edit", { gistid: this.state.gistid });
    }
  };

  render() {
    return (
      <div className="centering">
        <style jsx>{`
          .centering {
            position: absolute;
            display: flex;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            font-family: Source Sans Pro, Helvetica, sans-serif;
          }
          button {
            margin-left: 0.5em;
            padding: 0.5em;
            border: none;
            outline: none;
            border: solid 1px black;
            background-color: black;
            color: white;
            font-size: inherit;
            white-space: nowrap;
          }

          button:hover {
            background-color: rgba(0, 0, 0, 0.75);
            border-color: rgba(0, 0, 0, 0.75);
          }

          input {
            width: 25em;
            padding: 0.5em;
            border: solid 1px black;
            font-size: inherit;
          }

          input:focus {
            outline: none;
          }
        `}</style>
        <input
          placeholder="Gist ID"
          value={this.state.gistid}
          onChange={this.handleChange}
          onKeyDown={this.handleKeydown}
        />
        <button onClick={this.handleConfirm}>Launch Notebook</button>
      </div>
    );
  }
}

export default Input;
