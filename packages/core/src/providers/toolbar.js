// @flow
import * as React from "react";
import * as actions from "../actions";
import ToolbarView from "../components/toolbar";
import { connect } from "react-redux";

type Props = {
  id: string,
  type: "markdown" | "code" | "raw",
  executeCell: () => void,
  removeCell: () => void,
  toggleStickyCell: () => void,
  clearOutputs: () => void,
  toggleCellOutputVisibility: () => void,
  toggleCellInputVisibility: () => void,
  changeCellType: () => void,
  toggleOutputExpansion: () => void
};

const Toolbar = (props: Props) => (
  <ToolbarView
    type={props.type}
    executeCell={props.executeCell}
    removeCell={props.removeCell}
    toggleStickyCell={props.toggleStickyCell}
    clearOutputs={props.clearOutputs}
    toggleCellInputVisibility={props.toggleCellInputVisibility}
    toggleCellOutputVisibility={props.toggleCellOutputVisibility}
    toggleOutputExpansion={props.toggleOutputExpansion}
    changeCellType={props.changeCellType}
  />
);

const mapDispatchToProps = (dispatch, { id, type }) => ({
  toggleStickyCell: () => dispatch(actions.toggleStickyCell(id)),
  removeCell: () => dispatch(actions.removeCell(id)),
  executeCell: () => dispatch(actions.executeCell(id)),
  clearOutputs: () => dispatch(actions.clearOutputs(id)),
  toggleCellInputVisibility: () =>
    dispatch(actions.toggleCellInputVisibility(id)),
  toggleCellOutputVisibility: () =>
    dispatch(actions.toggleCellOutputVisibility(id)),
  changeCellType: () =>
    dispatch(
      actions.changeCellType(id, type === "markdown" ? "code" : "markdown")
    ),
  toggleOutputExpansion: () => dispatch(actions.toggleOutputExpansion(id))
});

export default connect(null, mapDispatchToProps)(Toolbar);
