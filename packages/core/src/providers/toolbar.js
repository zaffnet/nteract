// @flow
import * as React from "react";
import { connect } from "react-redux";
import ToolbarView from "../components/toolbar";

import {
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  toggleCellOutputVisibility,
  toggleCellInputVisibility,
  changeCellType,
  toggleOutputExpansion
} from "../actions";

import type { Action } from "@nteract/types/redux";

type Props = {
  id: string,
  source: string,
  type: "markdown" | "code" | "raw",
  dispatch: Dispatch<Action>
};

class Toolbar extends React.PureComponent<Props> {
  removeCell: () => void;
  executeCell: () => void;
  clearOutputs: () => void;
  toggleStickyCell: () => void;
  toggleCellInputVisibility: () => void;
  toggleCellOutputVisibility: () => void;
  changeCellType: () => void;
  toggleOutputExpansion: () => void;

  constructor(props: Props): void {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.toggleCellInputVisibility = this.toggleCellInputVisibility.bind(this);
    this.toggleCellOutputVisibility = this.toggleCellOutputVisibility.bind(
      this
    );
    this.changeCellType = this.changeCellType.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
  }

  toggleStickyCell(): void {
    const { dispatch } = this.props;
    dispatch(toggleStickyCell(this.props.id));
  }

  removeCell(): void {
    const { dispatch } = this.props;
    dispatch(removeCell(this.props.id));
  }

  executeCell(): void {
    const { dispatch } = this.props;
    dispatch(executeCell(this.props.id, this.props.source));
  }

  clearOutputs(): void {
    const { dispatch } = this.props;
    dispatch(clearOutputs(this.props.id));
  }

  toggleCellInputVisibility(): void {
    const { dispatch } = this.props;
    dispatch(toggleCellInputVisibility(this.props.id));
  }

  toggleCellOutputVisibility(): void {
    const { dispatch } = this.props;
    dispatch(toggleCellOutputVisibility(this.props.id));
  }

  changeCellType(): void {
    const { dispatch } = this.props;
    const to = this.props.type === "markdown" ? "code" : "markdown";
    dispatch(changeCellType(this.props.id, to));
  }

  toggleOutputExpansion(): void {
    const { dispatch } = this.props;
    dispatch(toggleOutputExpansion(this.props.id));
  }

  render(): ?React$Element<any> {
    return (
      <ToolbarView
        type={this.props.type}
        executeCell={this.executeCell}
        removeCell={this.removeCell}
        toggleStickyCell={this.toggleStickyCell}
        clearOutputs={this.clearOutputs}
        toggleCellInputVisibility={this.toggleCellInputVisibility}
        toggleCellOutputVisibility={this.toggleCellOutputVisibility}
        toggleOutputExpansion={this.toggleOutputExpansion}
        changeCellType={this.changeCellType}
      />
    );
  }
}

export default connect()(Toolbar);
