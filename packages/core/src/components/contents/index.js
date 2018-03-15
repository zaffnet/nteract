// @flow

import * as React from "react";
import * as Immutable from "immutable";

import * as selectors from "../../selectors";
import * as actions from "../../actions";

import type { ContentRef } from "../../state/refs";
import { connect } from "react-redux";

const mapStateToProps = (state: *, ownProps: *): * => {
  return {
    contentRef: ownProps.contentRef || selectors.currentContentRef(state)
  };
};

const mapDispatchToProps = (state: *, ownProps: *): * => {
  return {};
};

class Contents extends React.PureComponent<*, *> {
  render() {
    <div>{this.props.contentRef}</div>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Contents);
