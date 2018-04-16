// @flow
import * as React from "react";
import { connect } from "react-redux";
import * as selectors from "../selectors";
import type { ContentRef } from "../state/refs";
import type { AppState } from "../state";

import { omit } from "lodash";

import { focusCell, focusCellEditor, updateCellSource } from "../actions";

import EditorView from "@nteract/editor";

type Props = {
  id: string,
  cellFocused: boolean,
  contentRef: ContentRef,
  options: Object
};

function mapStateToProps(state: AppState, ownProps: Props) {
  const kernel = selectors.currentKernel(state);
  const { cursorBlinkRate } = selectors.userPreferences(state);
  return {
    // Don't propagate props only used for setting up dispatch and computed props
    ...omit(ownProps, [
      "id",
      "cellFocused",
      "contentRef",
      "options",
      "channels",
      "kernelStatus"
    ]),
    // Merge in our _one_ configurable options dealy
    // Ideally this would be Immutable or remain consistent so that
    // we're not thrashing updates and renders...
    options: Object.assign({}, ownProps.options, { cursorBlinkRate }),
    channels: kernel ? kernel.channels : null,
    kernelStatus: selectors.currentKernelStatus(state) || "not connected"
  };
}

const mapDispatchToProps = (dispatch: Dispatch<*>, ownProps: Props) => {
  const { cellFocused, id, contentRef } = ownProps;

  return {
    onChange: (text: string) => {
      dispatch(updateCellSource({ id, value: text, contentRef }));
    },

    onFocusChange(focused: boolean): void {
      if (focused) {
        dispatch(focusCellEditor({ id, contentRef }));
        if (!cellFocused) {
          dispatch(focusCell({ id, contentRef }));
        }
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorView);
