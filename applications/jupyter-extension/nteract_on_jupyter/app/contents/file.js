// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions, state as stateModule } from "@nteract/core";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type FileContentRecord = stateModule.FileContentRecord;

import { connect } from "react-redux";

type FileProps = {
  content: FileContentRecord
};

type TextFileProps = {
  data: string
};

export class TextFile extends React.PureComponent<TextFileProps, null> {
  static handles(mimetype: string) {
    return (
      mimetype.startsWith("text/") ||
      mimetype.startsWith("application/javascript")
    );
  }
  render() {
    return <pre>{this.props.data}</pre>;
  }
}

export class File extends React.PureComponent<FileProps, *> {
  render() {
    if (!this.props.content.mimetype) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      return <pre>Can not render this file type</pre>;
    }

    const mimetype = this.props.content.mimetype;

    if (TextFile.handles(mimetype)) {
      return <TextFile data={this.props.content.model.text} />;
    }

    return <pre>Can not render this file type</pre>;
  }
}

export const ConnectedFile = connect(
  (state: Object, ownProps: { contentRef: ContentRef }): FileProps => {
    return { content: selectors.contentByRef(state, ownProps) };
  }
)(File);

export default ConnectedFile;
