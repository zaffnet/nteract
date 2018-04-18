// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions, state as stateModule } from "@nteract/core";

import { JSONTransform, TextTransform } from "@nteract/transforms";
import MonacoEditor from "@nteract/monaco-editor";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type FileContentRecord = stateModule.FileContentRecord;

import { connect } from "react-redux";

type FileProps = {
  content: FileContentRecord,
  contentRef: ContentRef
};

type TextFileProps = {
  content: FileContentRecord,
  contentRef: ContentRef,
  handleChange: string => void
};

export class TextFile extends React.PureComponent<TextFileProps, null> {
  static handles(mimetype: string) {
    return (
      mimetype.startsWith("text/") ||
      mimetype.startsWith("application/javascript") ||
      mimetype.startsWith("application/json")
    );
  }
  handleChange(source: string) {
    this.props.handleChange(source);
  }
  render() {
    return (
      <div className="nteract-editor">
        <MonacoEditor
          theme="light"
          mode={this.props.content.mimetype}
          options={{
            lineNumbers: true,
            cursorBlinkRate: 0,
            mode: this.props.content.mimetype
          }}
          value={this.props.content.model.text}
          onChange={this.handleChange.bind(this)}
          contentRef={this.props.contentRef}
        />
        <style jsx>
          {`
            .nteract-editor {
              position: absolute;
              left: 0;
              height: 100%;
              width: 100%;
            }

            .nteract-editor :global(.monaco) {
              height: 100%;
            }
          `}
        </style>
      </div>
    );
  }
}

const mapDispatchToTextFileProps = (dispatch, ownProps) => ({
  handleChange: (source: string) => {
    dispatch(
      actions.updateFileText({
        text: source,
        contentRef: ownProps.contentRef
      })
    );
  }
});

const ConnectedTextFile = connect(null, mapDispatchToTextFileProps)(TextFile);

export class File extends React.PureComponent<FileProps, *> {
  render() {
    if (!this.props.content.mimetype) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      return <pre>Can not render this file type</pre>;
    }

    const mimetype = this.props.content.mimetype;
    const text = this.props.content.model.text;

    if (JSONTransform.handles(mimetype)) {
      const data = JSON.parse(text);
      return <JSONTransform data={data} />;
    } else if (TextFile.handles(mimetype)) {
      return (
        <ConnectedTextFile
          content={this.props.content}
          contentRef={this.props.contentRef}
        />
      );
    }

    return <pre>Can not render this file type</pre>;
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

  return { content: content, contentRef: ownProps.contentRef };
};

export const ConnectedFile = connect(mapStateToProps)(File);

export default ConnectedFile;
