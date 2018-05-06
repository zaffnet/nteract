// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions } from "@nteract/core";
import type { ContentRef, FileContentRecord } from "@nteract/core";

import * as TextFile from "./text-file.js";

import { connect } from "react-redux";

const Container = ({ children }) => (
  <div>
    {children}
    <style jsx>{`
      div {
        padding-left: var(--nt-spacing-l, 10px);
        padding-top: var(--nt-spacing-m, 10px);
        padding-right: var(--nt-spacing-m, 10px);
      }
    `}</style>
  </div>
);

type FileProps = {
  contentRef: ContentRef,
  mimetype: ?string
};

export class File extends React.PureComponent<FileProps, *> {
  render() {
    if (!this.props.mimetype || !TextFile.handles(this.props.mimetype)) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      return (
        <Container>
          <pre>Can not render this file type</pre>
        </Container>
      );
    }

    // Right now we only handle one kind of editor
    // If/when we support more modes, we would case them off here
    return <TextFile.default contentRef={this.props.contentRef} />;
  }
}

const mapStateToProps = (
  state: Object,
  ownProps: { contentRef: ContentRef }
): FileProps => {
  const content = selectors.content(state, ownProps);

  if (!content || content.type !== "file") {
    throw new Error(
      "The file component should only be used with file contents"
    );
  }

  return { mimetype: content.mimetype, contentRef: ownProps.contentRef };
};

export const ConnectedFile = connect(mapStateToProps)(File);

export default ConnectedFile;
