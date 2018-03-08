// @flow
import * as React from "react";
import { connect } from "react-redux";
import * as selectors from "../selectors";
import type { ContentRef } from "../state/refs";

import { focusCell, focusCellEditor, updateCellSource } from "../actions";

import EditorView from "@nteract/editor";

import type { CodeMirrorEditorProps } from "@nteract/editor";

type Props = CodeMirrorEditorProps & {
  dispatch: Dispatch<*>,
  id: string,
  cellFocused: boolean,
  channels: any,
  kernelStatus: string,
  options: Object,
  contentRef?: ContentRef
};

function mapStateToProps(
  state: Object,
  ownProps: CodeMirrorEditorProps
): Object {
  const kernel = selectors.currentKernel(state);
  const { cursorBlinkRate } = selectors.userPreferences(state);
  return {
    options: ownProps.options
      ? Object.assign(ownProps.options, { cursorBlinkRate })
      : { cursorBlinkRate },
    channels: kernel ? kernel.channels : null,
    kernelStatus: selectors.currentKernelStatus(state)
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
    const { dispatch, id, contentRef } = this.props;
    dispatch(updateCellSource({ id, value: text, contentRef }));
  }

  onFocusChange(focused: boolean): void {
    const { cellFocused, dispatch, id, contentRef } = this.props;

    if (focused) {
      dispatch(focusCellEditor({ id, contentRef }));
      if (!cellFocused) {
        dispatch(focusCell({ id, contentRef }));
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

// $FlowFixMe: The editor ownProps and mapped props need addressing
export default connect(mapStateToProps)(Editor);
