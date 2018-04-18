// @flow
/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";

import { of } from "rxjs/observable/of";
import { fromEvent } from "rxjs/observable/fromEvent";
import type { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Map as ImmutableMap } from "immutable";

import { RichestMime } from "@nteract/display-area";

import { debounce, merge } from "lodash";

import * as monaco from "monaco-editor";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

export type MonacoEditorProps = {
  editorFocused: boolean,
  theme: string,
  mode: string,
  channels: ?any,
  // TODO: We only check if this is idle, so the completion provider should only
  //       care about this when kernelStatus === idle _and_ we're the active cell
  //       could instead call it `canTriggerCompletion` and reduce our current re-renders
  kernelStatus: string,
  onChange: (value: string, change: EditorChange) => void,
  onFocusChange: ?(focused: boolean) => void,
  value: string,
  defaultValue?: string,
  options: Options
};

type MonacoEditorState = {
  isFocused: boolean
};

class MonacoEditor extends React.Component<
  MonacoEditorProps,
  MonacoEditorState
> {
  executeTab: (editor: Object) => void;
  keyupEventsSubscriber: Subscription;

  static defaultProps = {
    onChange: null,
    onFocusChange: null
  };

  constructor(props: MonacoEditorProps): void {
    super(props);
    this.state = { isFocused: true, tipElement: null };
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  onDidChangeModelContent(e): void {
    this.props.onChange(this.monaco.getValue());
  }

  componentDidMount(): void {
    const { editorFocused, kernelStatus, focusAbove, focusBelow } = this.props;
    window.MonacoEnvironment = {
      getWorkerUrl: function(moduleId, label) {
        console.log(moduleId);
        return "./editor.worker.bundle.js";
      }
    };
    console.log(this);
    this.monaco = monaco.editor.create(this.monacoContainer, {
      value: this.props.value,
      language: this.props.mode,
      minimap: {
        enabled: false
      }
    });

    this.monaco.onDidChangeModelContent(
      this.onDidChangeModelContent.bind(this)
    );
  }

  componentDidUpdate(prevProps: MonacoEditorProps): void {
    if (!this.monaco) return;
  }

  componentWillReceiveProps(nextProps: MonacoEditorProps) {
    console.log(nextProps);
  }

  componentWillUnmount() {
    // TODO: is there a lighter weight way to remove the codemirror instance?
    if (this.cm) {
      this.cm.toTextArea();
    }
    this.keyupEventsSubscriber.unsubscribe();
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  render(): React$Element<any> {
    return (
      <div
        className="monaco cm-s-composition"
        ref={container => {
          this.monacoContainer = container;
        }}
      />
    );
  }
}

export default MonacoEditor;
