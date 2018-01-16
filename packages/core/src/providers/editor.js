// @flow
import * as React from "react";
import { connect } from "react-redux";

import { focusCell, focusCellEditor, updateCellSource } from "../actions";

import EditorView from "@nteract/editor";

import type { CodeMirrorEditorProps } from "@nteract/editor";

type Props = CodeMirrorEditorProps & {
  dispatch: Dispatch<*>,
  id: string,
  cellFocused: boolean,
  channels: any,
  executionState: "idle" | "starting" | "not connected",
  options: Object
};

function mapStateToProps(
  state: Object,
  ownProps: CodeMirrorEditorProps
): Object {
  return {
    options: ownProps.options
      ? Object.assign(ownProps.options, {
          cursorBlinkRate: state.config.get("cursorBlinkRate")
        })
      : { cursorBlinkRate: state.config.get("cursorBlinkRate") },
    channels: state.app.kernel ? state.app.kernel.channels : null,
    executionState: state.app.executionState
  };
}

class Editor extends React.Component<Props> {
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;

  constructor(): void {
    super();

    this.onChange = this.onChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onChange(text: string): void {
    const { dispatch, id } = this.props;

    dispatch(updateCellSource(id, text));
  }

  onFocusChange(focused: boolean): void {
    const { cellFocused, dispatch, id } = this.props;

    if (focused) {
      dispatch(focusCellEditor(id));
      if (!cellFocused) {
        dispatch(focusCell(id));
      }
    }
  }

  render(): React$Element<any> {
    const props = {
      ...this.props,
      onChange: this.onChange,
      onFocusChange: this.onFocusChange
    };

    return <EditorView {...props} />;
  }
}

export default connect(mapStateToProps)(Editor);
