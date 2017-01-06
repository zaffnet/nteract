// @flow
/* eslint-disable react/no-unused-prop-types */
import React from 'react';

import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { connect } from 'react-redux';
import Cell from '../components/cell/cell';
import { focusCell } from '../actions';

import DraggableCellView from '../views/draggable-cell';

type Props = {
  dispatch: Dispatch,
  id: string,
};

class DraggableCell extends React.PureComponent {
  props: Props;
  selectCell: () => void;

  constructor(): void {
    super();
    this.selectCell = this.selectCell.bind(this);
  }


  selectCell(): void {
    const { dispatch, id } = this.props
    dispatch(focusCell(id));
  }

  render(): ?React.Element<any> {
    const props : DispatchCellProps = {
      ...this.props,
      selectCell: this.selectCell,
    }
    return <DraggableCellView {...props} />;
  }
}

export default connect()(DraggableCell);
