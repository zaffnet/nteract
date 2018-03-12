/* eslint-disable no-return-assign */
/* @flow */
import * as Immutable from "immutable";
import * as React from "react";
import * as selectors from "../selectors";
import type { ContentRef } from "../state/refs";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Set as ImmutableSet,
  isImmutable
} from "immutable";

import { HijackScroll } from "./hijack-scroll";

import MathJax from "@nteract/mathjax";

import MarkdownPreviewer from "./markdown-preview";
import Toolbar from "./toolbar";

import { Display, RichestMime } from "@nteract/display-area";

import Editor from "./editor";

import { displayOrder, transforms } from "@nteract/transforms";

import { Input, Prompt, Source, Pagers, Outputs, Cell } from "./presentational";

import DraggableCell from "./draggable-cell";
import CellCreator from "./cell-creator";
import StatusBar from "./status-bar";

import * as actions from "../actions";

// NOTE: PropTypes are required for the sake of contextTypes
const PropTypes = require("prop-types");

const themes = require("../themes");

type AnyCellProps = {
  id: string,
  contentRef: ContentRef,
  cellType: "markdown" | "code" | "raw",
  theme: string,
  source: string,
  executionCount: *,
  outputs: ImmutableList<*>,
  pager: ImmutableList<*>,
  cellStatus: string,
  cellFocused: boolean, // not the ID of which is focused
  editorFocused: boolean,
  sourceHidden: boolean,
  outputHidden: boolean,
  outputExpanded: boolean,
  displayOrder: typeof displayOrder,
  transforms: typeof transforms,
  models: ImmutableMap<string, *>,
  codeMirrorMode: *,
  selectCell: () => void,
  focusEditor: () => void,
  unfocusEditor: () => void,
  focusAboveCell: () => void,
  focusBelowCell: () => void
};

const mapStateToCellProps = (state, { id }) => {
  const cellMap = selectors.currentCellMap(state);
  const cell = cellMap && cellMap.get(id);
  if (!cell) {
    throw new Error("cell not found inside cell map");
  }

  const cellType = cell.get("cell_type");
  const outputs = cell.get("outputs", ImmutableList());

  const sourceHidden =
    cellType === "code" &&
    (cell.getIn(["metadata", "inputHidden"], false) ||
      cell.getIn(["metadata", "hide_input"], false));

  const outputHidden =
    cellType === "code" &&
    (outputs.size === 0 || cell.getIn(["metadata", "outputHidden"]));

  const outputExpanded =
    cellType === "code" && cell.getIn(["metadata", "outputExpanded"]);

  return {
    cellType,
    source: cell.get("source", ""),
    theme: selectors.userPreferences(state).theme,
    executionCount: cell.get("execution_count"),
    outputs,
    models: selectors.models(state),
    pager: selectors.cellPagers(state).get(id, ImmutableList()),
    cellFocused: selectors.currentFocusedCellId(state) === id,
    editorFocused: selectors.currentFocusedEditorId(state) === id,
    sourceHidden,
    outputHidden,
    outputExpanded,
    cellStatus: selectors.transientCellMap(state).getIn([id, "status"])
  };
};

const mapDispatchToCellProps = (dispatch, { id, contentRef }) => ({
  selectCell: () => dispatch(actions.focusCell({ id, contentRef })),
  focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
  unfocusEditor: () =>
    dispatch(actions.focusCellEditor({ id: null, contentRef })),
  focusAboveCell: () => {
    dispatch(actions.focusPreviousCell({ id, contentRef }));
    dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
  },
  focusBelowCell: () => {
    dispatch(
      actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
    );
    dispatch(actions.focusNextCellEditor({ id, contentRef }));
  }
});

class AnyCell extends React.PureComponent<AnyCellProps, *> {
  static contextTypes = {
    store: PropTypes.object
  };

  render(): ?React$Element<any> {
    const {
      cellFocused,
      cellStatus,
      cellType,
      editorFocused,
      focusAboveCell,
      focusBelowCell,
      focusEditor,
      id,
      selectCell,
      unfocusEditor,
      contentRef
    } = this.props;

    const running = cellStatus === "busy";
    const queued = cellStatus === "queued";
    let element = null;

    switch (cellType) {
      case "code":
        element = (
          <React.Fragment>
            <Input hidden={this.props.sourceHidden}>
              <Prompt
                counter={this.props.executionCount}
                running={running}
                queued={queued}
              />
              <Source>
                <Editor
                  tip
                  completion
                  id={id}
                  contentRef={contentRef}
                  value={this.props.source}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={focusAboveCell}
                  focusBelow={focusBelowCell}
                  options={{
                    mode: isImmutable(this.props.codeMirrorMode)
                      ? this.props.codeMirrorMode.toJS()
                      : this.props.codeMirrorMode
                  }}
                />
              </Source>
            </Input>
            <Pagers>
              {this.props.pager.map((pager, key) => (
                <RichestMime
                  expanded
                  className="pager"
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  bundle={pager}
                  theme={this.props.theme}
                  key={key}
                />
              ))}
            </Pagers>
            <Outputs
              hidden={this.props.outputHidden}
              expanded={this.props.outputExpanded}
            >
              <Display
                className="outputs-display"
                outputs={this.props.outputs.toJS()}
                displayOrder={this.props.displayOrder}
                transforms={this.props.transforms}
                theme={this.props.theme}
                expanded={this.props.outputExpanded}
                isHidden={this.props.outputHidden}
                models={this.props.models.toJS()}
              />
            </Outputs>
          </React.Fragment>
        );

        break;
      case "markdown":
        element = (
          <MarkdownPreviewer
            focusAbove={focusAboveCell}
            focusBelow={focusBelowCell}
            focusEditor={focusEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            unfocusEditor={unfocusEditor}
            source={this.props.source}
          >
            <Source>
              <Editor
                id={id}
                value={this.props.source}
                theme={this.props.theme}
                focusAbove={focusAboveCell}
                focusBelow={focusBelowCell}
                cellFocused={cellFocused}
                editorFocused={editorFocused}
                contentRef={contentRef}
                options={{
                  // Markdown should always be line wrapped
                  lineWrapping: true,
                  // Rely _directly_ on the codemirror mode
                  mode: {
                    name: "gfm",
                    tokenTypeOverrides: {
                      emoji: "emoji"
                    }
                  }
                }}
              />
            </Source>
          </MarkdownPreviewer>
        );
        break;

      default:
        element = <pre>{this.props.source}</pre>;
        break;
    }

    return (
      <HijackScroll focused={cellFocused} onClick={selectCell}>
        <Cell isSelected={cellFocused}>
          <Toolbar
            type={cellType}
            id={id}
            source={this.props.source}
            contentRef={contentRef}
          />
          {element}
          <style jsx>{`
            /*
           * Show the cell-toolbar-mask if hovering on cell,
           * or cell was the last clicked (has .focused class).
           */
            :global(.cell:hover .cell-toolbar-mask),
            :global(.cell.focused .cell-toolbar-mask) {
              display: block;
            }
          `}</style>
        </Cell>
      </HijackScroll>
    );
  }
}

export const ConnectedCell = connect(
  mapStateToCellProps,
  mapDispatchToCellProps
)(AnyCell);

type NotebookProps = NotebookStateProps & NotebookDispatchProps;

type PureNotebookProps = {
  displayOrder?: Array<string>,
  cellOrder?: ImmutableList<any>,
  transforms?: Object,
  theme?: string,
  lastSaved?: Date,
  languageDisplayName?: string,
  kernelStatus?: string,
  codeMirrorMode?: string | ImmutableMap<string, *>,
  // TODO: Once we're willing to do multi-contents views, we should require this
  //       to be passed in
  // TODO: Fill in more from the convo with Andrew here
  contentRef?: ContentRef
};

type NotebookStateProps = {
  displayOrder: Array<string>,
  cellOrder: ImmutableList<any>,
  transforms: Object,
  theme: string,
  lastSaved: ?Date,
  languageDisplayName: string,
  kernelStatus: string,
  codeMirrorMode: string | ImmutableMap<string, *>,
  contentRef: ContentRef
};

type NotebookDispatchProps = {
  moveCell: (payload: *) => *,
  focusCell: (payload: *) => *,
  executeFocusedCell: (payload: *) => *,
  focusNextCell: (*) => *,
  focusNextCellEditor: (*) => *
};

const mapStateToProps = (
  state: Object,
  ownProps: PureNotebookProps
): NotebookStateProps => {
  return {
    theme: selectors.userPreferences(state).theme,
    lastSaved: selectors.currentLastSaved(state),
    cellOrder: selectors.currentCellOrder(state) || Immutable.List(),
    kernelStatus: selectors.currentKernelStatus(state),
    languageDisplayName: selectors.currentDisplayName(state),
    transforms: ownProps.transforms || transforms,
    displayOrder: ownProps.displayOrder || displayOrder,
    codeMirrorMode: selectors.codeMirrorMode(state),
    // TODO: this will need to be a currentNotebookContentRef or some such...
    contentRef: ownProps.contentRef || selectors.currentContentRef(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch<*>): NotebookDispatchProps => ({
  moveCell: (payload: *) => dispatch(actions.moveCell(payload)),
  focusCell: (payload: *) => dispatch(actions.focusCell(payload)),
  executeFocusedCell: (payload: *) =>
    dispatch(actions.executeFocusedCell(payload)),
  focusNextCell: (payload: *) => dispatch(actions.focusNextCell(payload)),
  focusNextCellEditor: (payload: *) =>
    dispatch(actions.focusNextCellEditor(payload))
});

export class NotebookApp extends React.PureComponent<NotebookProps> {
  static defaultProps = {
    theme: "light",
    displayOrder,
    transforms
  };

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(): void {
    super();
    (this: any).createCellElement = this.createCellElement.bind(this);
    (this: any).keyDown = this.keyDown.bind(this);
    (this: any).renderCell = this.renderCell.bind(this);
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  keyDown(e: KeyboardEvent): void {
    // If enter is not pressed, do nothing
    if (e.keyCode !== 13) {
      return;
    }

    const {
      executeFocusedCell,
      focusNextCell,
      focusNextCellEditor,
      contentRef
    } = this.props;

    let ctrlKeyPressed = e.ctrlKey;
    // Allow cmd + enter (macOS) to operate like ctrl + enter
    if (process.platform === "darwin") {
      ctrlKeyPressed = (e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey);
    }

    const shiftXORctrl =
      (e.shiftKey || ctrlKeyPressed) && !(e.shiftKey && ctrlKeyPressed);
    if (!shiftXORctrl) {
      return;
    }

    e.preventDefault();

    // NOTE: Order matters here because we need it to execute _before_ we
    // focus the next cell
    executeFocusedCell({ contentRef });

    if (e.shiftKey) {
      // Couldn't focusNextCell just do focusing of both?
      focusNextCell({ id: null, createCellIfUndefined: true, contentRef });
      focusNextCellEditor({ id: null, contentRef });
    }
  }

  renderCell(id: string): ?React$Element<any> {
    const { contentRef } = this.props;
    return (
      <ConnectedCell
        id={id}
        transforms={this.props.transforms}
        displayOrder={this.props.displayOrder}
        codeMirrorMode={this.props.codeMirrorMode}
        contentRef={contentRef}
      />
    );
  }

  createCellElement(id: string): React$Element<*> {
    const { moveCell, focusCell, contentRef } = this.props;
    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        <DraggableCell
          moveCell={moveCell}
          id={id}
          focusCell={focusCell}
          contentRef={contentRef}
        >
          {this.renderCell(id)}
        </DraggableCell>
        <CellCreator
          key={`creator-${id}`}
          id={id}
          above={false}
          contentRef={contentRef}
        />
      </div>
    );
  }

  render(): ?React$Element<any> {
    return (
      <React.Fragment>
        <div className="cells">
          <CellCreator
            id={this.props.cellOrder.get(0)}
            above
            contentRef={this.props.contentRef}
          />
          {this.props.cellOrder.map(this.createCellElement)}
        </div>
        <StatusBar
          lastSaved={this.props.lastSaved}
          kernelSpecDisplayName={this.props.languageDisplayName}
          kernelStatus={this.props.kernelStatus}
        />
        <style jsx>{`
          .cells {
            padding-top: 10px;
            padding-left: 10px;
            padding-right: 10px;
          }
        `}</style>
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
  ${themes[this.props.theme]};
}`
          }}
        >
          {}
        </style>
      </React.Fragment>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(NotebookApp);
export default connect(mapStateToProps, mapDispatchToProps)(ConnectedNotebook);
