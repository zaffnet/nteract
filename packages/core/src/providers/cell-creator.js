// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../actions";
import CellCreatorView from "../components/cell-creator";

type Props = {
  above: boolean,
  createCellAppend: (type: string) => void,
  createCellBefore: (type: string, id: string) => void,
  createCellAfter: (type: string, id: string) => void,
  mergeCellAfter: (id: string) => void,
  id?: string
};

class CellCreator extends Component<Props> {
  createCell: (type: string) => void;
  mergeCell: () => void;

  constructor(): void {
    super();
    this.createCell = this.createCell.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
  }

  createCell(type: "code" | "markdown"): void {
    const {
      above,
      createCellAfter,
      createCellAppend,
      createCellBefore,
      id
    } = this.props;

    if (!id) {
      createCellAppend(type);
      return;
    }

    above ? createCellBefore(type, id) : createCellAfter(type, id);
  }

  mergeCell(): void {
    const { mergeCellAfter, id } = this.props;

    // We can't merge cells if we don't have a cell ID
    if (id) {
      mergeCellAfter(id);
    }
  }

  render(): React$Element<any> {
    return (
      <CellCreatorView
        above={this.props.above}
        createCell={this.createCell}
        mergeCell={this.mergeCell}
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  createCellAppend: type => dispatch(actions.createCellAppend(type)),
  createCellBefore: (type, id) => dispatch(actions.createCellBefore(type, id)),
  createCellAfter: (type, id) => dispatch(actions.createCellAfter(type, id)),
  mergeCellAfter: id => dispatch(actions.mergeCellAfter(id))
});

export default connect(null, mapDispatchToProps)(CellCreator);
