// @flow

import * as React from "react";
import * as Immutable from "immutable";

import * as selectors from "../../selectors";
import * as actions from "../../actions";

import { default as TitleBar } from "../title-bar";
import { default as NotebookApp } from "../notebook-app";
import { default as NotebookMenu } from "../notebook-menu";

import type { ContentRef } from "../../state/refs";
import { connect } from "react-redux";

const mapStateToProps = (state: *, ownProps: *): * => {
  return {
    contentType: selectors.currentContentType(state)
    /*
    // TODO: This could delegate to the component below to render based on
    //       the passed in content ref
    //       For now, notebook app still relies on currentContentRef directly
    contentRef: selectors.currentContentRef(state),
    currentContent: selectors.currentContent(state)
    */
  };
};

const mapDispatchToProps = (state: *, ownProps: *): * => {
  return {};
};

class Contents extends React.PureComponent<*, *> {
  render() {
    switch (this.props.contentType) {
      case "notebook":
        return (
          <React.Fragment>
            <TitleBar />
            <NotebookMenu />
            <NotebookApp />
          </React.Fragment>
        );
      case "dummy":
        return (
          <React.Fragment>
            <TitleBar />
            <div>loading...</div>
          </React.Fragment>
        );
      default:
        return <div>loading or something</div>;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Contents);
