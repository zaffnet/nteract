// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions, state as stateModule } from "@nteract/core";

import { JSONTransform, TextTransform } from "@nteract/transforms";
import CodeMirrorEditor from "@nteract/editor";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type FileContentRecord = stateModule.FileContentRecord;

import { connect } from "react-redux";

type FileProps = {
  content: FileContentRecord,
  contentRef: ContentRef
};

type TextFileProps = {
  dispatch: Dispatch<*>,
  content: FileContentRecord,
  contentRef: ContentRef
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
    this.props.dispatch(
      actions.updateFileText({
        text: source,
        contentRef: this.props.contentRef
      })
    );
    this.props.dispatch(
      actions.save({
        contentRef: this.props.contentRef
      })
    );
  }
  render() {
    return (
      <CodeMirrorEditor
        cellFocused
        editorFocused
        channels
        kernelStatus={"not connected"}
        tip
        completion
        theme="light"
        // TODO: This is the notebook implementation leaking into the editor
        //       component. It shouldn't be here, I won't refactor it as part
        //       of the current play PR though.
        id="not-really-a-cell"
        onFocusChange={() => {}}
        focusAbove={() => {}}
        focusBelow={() => {}}
        // END TODO for notebook leakage
        // TODO: kernelStatus should be allowed to be null or undefined,
        //       resulting in thought of as either idle or not connected by
        //       default. This is primarily used for determining if code
        //       completion should be enabled
        options={{
          lineNumbers: true,
          cursorBlinkRate: 0,
          mode: this.props.content.mimetype
        }}
        value={this.props.content.model.text}
        onChange={this.handleChange.bind(this)}
        contentRef={this.props.contentRef}
      />
    );
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
    const text = this.props.content.model.text;

    if (JSONTransform.handles(mimetype)) {
      const data = JSON.parse(text);
      return <JSONTransform data={data} />;
    } else if (TextFile.handles(mimetype)) {
      return (
        <TextFile
          content={this.props.content}
          contentRef={this.props.contentRef}
          dispatch={this.props.dispatch}
        />
      );
    }

    return <pre>Can not render this file type</pre>;
  }
}

export const ConnectedFile = connect(
  (state: Object, ownProps: { contentRef: ContentRef }): FileProps => {
    const content = selectors.content(state, ownProps);

    if (!content || content.type !== "file") {
      throw new Error(
        "The file component should only be used with file contents"
      );
    }

    return { content: content, contentRef: ownProps.contentRef };
  }
)(File);

export default ConnectedFile;
