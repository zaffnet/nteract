/* @flow */

import * as Immutable from 'immutable';
import { handleActions } from 'redux-actions';
import * as uuid from 'uuid';
import * as commutable from 'commutable';

import * as constants from '../constants';

// Note that we can't use the type definition of Output from records.js
// because it's an Immutable.Map here. When we have a union on Immutable Records.
// We can swap these out later.

type ImmutableOutput = Immutable.Map<string, any>;
type ImmutableOutputs = Immutable.List<ImmutableOutput>;

// Non-immutable output
type JSON = | string | number | boolean | null | JSONObject | JSONArray; // eslint-disable-line no-use-before-define
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

type ExecutionCount = number | null;

type MimeBundle = JSONObject;

type ExecuteResult = {
  output_type: 'execute_result',
  execution_count: ExecutionCount,
  data: MimeBundle,
  metadata: JSONObject,
}

export type DisplayData = {
  output_type: 'display_data',
  data: MimeBundle,
  metadata: JSONObject,
  transient?: JSONObject,
}

export type StreamOutput = {
  output_type: 'stream',
  name: 'stdout' | 'stderr',
  text: string,
}

export type ErrorOutput = {
  output_type: 'error',
  ename: string,
  evalue: string,
  traceback: Array<string>,
}

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

/*
 * Alias for ECMAScript `Iterable` type, declared in
 * https://github.com/facebook/flow/blob/master/lib/core.js
 *
 * Note that Immutable values implement the `ESIterable` interface.
 */
type ESIterable<T> = $Iterable<T, void, void>;
type KeyPath = ESIterable<any>;
type KeyPaths = Immutable.List<KeyPath>;

// It's really an Immutable.Record<Document>, we'll do this for now until a fix
// https://github.com/facebook/immutable-js/issues/998
type DocumentState = Immutable.Map<string, any>; // & Document;

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Immutable.List<Object>} updated-outputs - Outputs + Output
 */
export function reduceOutputs(outputs: ImmutableOutputs = Immutable.List(), output: Output) { // eslint-disable-line max-len
  if (output.output_type !== 'stream' ||
     (outputs.size > 0 && outputs.last().get('output_type') !== 'stream')) {
    // If it's not a stream type, we just fold in the output
    return outputs.push(Immutable.fromJS(output));
  }

  const streamOutput : StreamOutput = output;

  function appendText(text: string): string {
    return text + streamOutput.text;
  }

  if (outputs.size > 0 &&
      typeof streamOutput.name !== 'undefined' &&
      outputs.last().get('output_type') === 'stream'
    ) {
    // Invariant: size > 0, outputs.last() exists
    if (outputs.last().get('name') === streamOutput.name) {
      return outputs.updateIn([outputs.size - 1, 'text'], appendText);
    }
    const nextToLast = outputs.butLast().last();
    if (nextToLast &&
        nextToLast.get('output_type') === 'stream' &&
        nextToLast.get('name') === streamOutput.name) {
      return outputs.updateIn([outputs.size - 2, 'text'], appendText);
    }
  }

  return outputs.push(Immutable.fromJS(streamOutput));
}

export function cleanCellTransient(state: DocumentState, id: string) {
  // Clear out key paths that should no longer be referenced
  return state.updateIn(['transient', 'keyPathsForDisplays'], kpfd =>
    kpfd.map(keyPaths =>
      keyPaths.filter(keyPath => keyPath.get(2) !== id)
    )
  ).setIn(['transient', 'cellMap'], new Immutable.Map());
}

type Cell = Immutable.Map<string, any>;
type Cells = Immutable.List<Cell>;
type Notebook = Immutable.Map<string, any>;

type CellID = string;

// TODO: type that notebook!
// It would probably be wise to make this JSON serializable and not be using
// the immutable.js version of the notebook in the action
type SetNotebookAction = { type: 'SET_NOTEBOOK', notebook: Notebook };
type FocusCellAction = { type: 'FOCUS_CELL', id: CellID };
type ClearOutputsAction = { type: 'CLEAR_OUTPUTS', id: CellID };

function setNotebook(state: DocumentState, action: SetNotebookAction) {
  const notebook = action.notebook
    .update('cellMap', (cells: Cells): Cells =>
      // TODO: Determine why setting the notebook is changing these values.
      //       Should they be transient or part of an overall app state?
      cells.map(value =>
        value.setIn(['metadata', 'inputHidden'], false)
              .setIn(['metadata', 'outputHidden'], false)
              .setIn(['metadata', 'outputExpanded'], false)));

  return state.set('notebook', notebook)
    .set('cellFocused', notebook.getIn(['cellOrder', 0]))
    .setIn(['transient', 'cellMap'], new Immutable.Map());
}

function focusCell(state: DocumentState, action: FocusCellAction) {
  return state.set('cellFocused', action.id);
}

function clearOutputs(state: DocumentState, action: ClearOutputsAction) {
  const { id } = action;
  const type = state.getIn(['notebook', 'cellMap', id, 'cell_type']);

  if (type === 'code') {
    return cleanCellTransient(
      state.setIn(['notebook', 'cellMap', id, 'outputs'], new Immutable.List()),
      id
    );
  }
  return state;
}

type AppendOutputAction = { type: 'APPEND_OUTPUT', id: CellID, output: Output };

function appendOutput(state: DocumentState, action: AppendOutputAction) {
  const output = action.output;
  const cellID = action.id;

  if (output.output_type !== 'display_data' ||
    !(output && output.transient && output.transient.display_id)) {
    return state.updateIn(
      ['notebook', 'cellMap', cellID, 'outputs'],
      (outputs: ImmutableOutputs): ImmutableOutputs => reduceOutputs(outputs, output));
  }

  // We now have a display_data that includes a transient display_id
  // output: {
  //   data: { 'text/html': '<b>woo</b>' }
  //   metadata: {}
  //   transient: { display_id: '12312' }
  // }

  // We now have a display to track
  const displayID = output.transient.display_id;

  // Every time we see a display id we're going to capture the keypath
  // to the output

  // Determine the next output index
  const outputIndex = state.getIn(
    ['notebook', 'cellMap', cellID, 'outputs'],
    Immutable.List()
  ).count();

  // Construct the path to the output for updating later
  const keyPath = Immutable.List(['notebook', 'cellMap', cellID, 'outputs', outputIndex]);

  const keyPaths = state
    // Extract the current list of keypaths for this displayID
    .getIn(
      ['transient', 'keyPathsForDisplays', displayID], new Immutable.List()
    )
    // Append our current output's keyPath
    .push(keyPath);

  const immutableOutput: ImmutableOutput = Immutable.fromJS(output);

  // We'll reduce the overall state based on each keypath, updating output
  return keyPaths.reduce((currState, kp) => currState.setIn(kp, immutableOutput), state)
    .setIn(['transient', 'keyPathsForDisplays', displayID], keyPaths);
}

type UpdateDisplayAction = { type: 'UPDATE_DISPLAY', output: Output };

function updateDisplay(state: DocumentState, action: UpdateDisplayAction) {
  const output: ImmutableOutput = Immutable.fromJS(action.output);
  const displayID = output.getIn(['transient', 'display_id']);
  const keyPaths: KeyPaths = state
    .getIn(
      ['transient', 'keyPathsForDisplays', displayID], new Immutable.List());
  return keyPaths.reduce((currState: DocumentState, kp: KeyPath) =>
    currState.setIn(kp, output), state);
}

type FocusNextCellAction = { type: 'FOCUS_NEXT_CELL', id: CellID, createCellIfUndefined: boolean }

function focusNextCell(state: DocumentState, action: FocusNextCellAction) {
  const cellOrder = state.getIn(['notebook', 'cellOrder'], Immutable.List());
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);

  const nextIndex = curIndex + 1;

  // When at the end, create a new cell
  if (nextIndex >= cellOrder.size) {
    if (!action.createCellIfUndefined) {
      return state;
    }

    const cellID: CellID = uuid.v4();
    // TODO: condition on state.defaultCellType (markdown vs. code)
    // TODO: type cells (these could be records...)
    const cell = commutable.emptyCodeCell;
    return state.set('cellFocused', cellID)
      .update('notebook',
        notebook => commutable.insertCellAt(notebook, cell, cellID, nextIndex))
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
  }

  // When in the middle of the notebook document, move to the next cell
  return state.set('cellFocused', cellOrder.get(nextIndex));
}

type FocusPreviousCellAction = { type: 'FOCUS_PREVIOUS_CELL', id: CellID };

function focusPreviousCell(state: DocumentState, action: FocusPreviousCellAction) {
  const cellOrder = state.getIn(['notebook', 'cellOrder'], Immutable.List());
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set('cellFocused', cellOrder.get(nextIndex));
}

export default handleActions({
  [constants.SET_NOTEBOOK]: setNotebook,
  [constants.FOCUS_CELL]: focusCell,
  [constants.CLEAR_OUTPUTS]: clearOutputs,
  [constants.APPEND_OUTPUT]: appendOutput,
  [constants.UPDATE_DISPLAY]: updateDisplay,
  [constants.FOCUS_NEXT_CELL]: focusNextCell,
  [constants.FOCUS_PREVIOUS_CELL]: focusPreviousCell,
  [constants.FOCUS_CELL_EDITOR]: function focusCellEditor(state, action) {
    return state.set('editorFocused', action.id);
  },
  [constants.FOCUS_NEXT_CELL_EDITOR]: function focusNextCellEditor(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = curIndex + 1;

    return state.set('editorFocused', cellOrder.get(nextIndex));
  },
  [constants.FOCUS_PREVIOUS_CELL_EDITOR]: function focusPreviousCellEditor(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = Math.max(0, curIndex - 1);

    return state.set('editorFocused', cellOrder.get(nextIndex));
  },
  [constants.TOGGLE_STICKY_CELL]: function toggleStickyCell(state, action) {
    const { id } = action;
    const stickyCells = state.get('stickyCells');
    if (stickyCells.has(id)) {
      return state.set('stickyCells', stickyCells.delete(id));
    }
    return state.set('stickyCells', stickyCells.add(id));
  },
  [constants.UPDATE_CELL_EXECUTION_COUNT]: function updateExecutionCount(state, action) {
    const { id, count } = action;
    return state.update('notebook',
      notebook => commutable.updateExecutionCount(notebook, id, count));
  },
  [constants.MOVE_CELL]: function moveCell(state, action) {
    return state.updateIn(['notebook', 'cellOrder'],
      (cellOrder) => {
        const oldIndex = cellOrder.findIndex(id => id === action.id);
        const newIndex = cellOrder.findIndex(id => id === action.destinationId)
                          + (action.above ? 0 : 1);
        if (oldIndex === newIndex) {
          return cellOrder;
        }
        return cellOrder
          .splice(oldIndex, 1)
          .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
      }
    );
  },
  [constants.REMOVE_CELL]: function removeCell(state, action) {
    const { id } = action;
    return cleanCellTransient(
      state.update('notebook',
        notebook => commutable.removeCell(notebook, id)
      ),
      id
    );
  },
  [constants.NEW_CELL_AFTER]: function newCellAfter(state, action) {
    const { cellType, id, source } = action;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const cellID = uuid.v4();
    return state.update('notebook', (notebook) => {
      const index = notebook.get('cellOrder').indexOf(id) + 1;
      return commutable.insertCellAt(notebook, cell.set('source', source), cellID, index);
    })
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
  },
  [constants.NEW_CELL_BEFORE]: function newCellBefore(state, action) {
    // Draft API
    const { cellType, id } = action;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const cellID = uuid.v4();
    return state.update('notebook', (notebook) => {
      const index = notebook.get('cellOrder').indexOf(id);
      return commutable.insertCellAt(notebook, cell, cellID, index);
    })
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
  },
  [constants.MERGE_CELL_AFTER]: function mergeCellAfter(state, action) {
    const { id } = action;
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const index = cellOrder.indexOf(id);
    // do nothing if this is the last cell
    if (cellOrder.size === index + 1) {
      return state;
    }
    const cellMap = state.getIn(['notebook', 'cellMap']);

    const nextId = cellOrder.get(index + 1);
    const source = cellMap.getIn([id, 'source'])
      .concat('\n', '\n', cellMap.getIn([nextId, 'source']));

    return state.update('notebook',
      notebook => commutable.removeCell(commutable.updateSource(notebook, id, source), nextId)
    );
  },
  [constants.NEW_CELL_APPEND]: function newCellAppend(state, action) {
    // Draft API
    const { cellType } = action;
    const notebook = state.get('notebook');
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const index = notebook.get('cellOrder').count();
    const cellID = uuid.v4();
    return state.set('notebook', commutable.insertCellAt(notebook, cell, cellID, index))
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
  },
  [constants.UPDATE_CELL_SOURCE]: function updateSource(state, action) {
    const { id, source } = action;
    return state.update('notebook', notebook => commutable.updateSource(notebook, id, source));
  },
  [constants.SPLIT_CELL]: function splitCell(state, action) {
    const { id, position } = action;
    const index = state.getIn(['notebook', 'cellOrder']).indexOf(id);
    const updatedState = state.update('notebook',
        notebook => commutable.splitCell(notebook, id, position));
    const newCell = updatedState.getIn(['notebook', 'cellOrder', index + 1]);
    return updatedState
      .setIn(['notebook', 'cellMap', newCell, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', newCell, 'metadata', 'inputHidden'], false);
  },
  [constants.CHANGE_OUTPUT_VISIBILITY]: function changeOutputVisibility(state, action) {
    const { id } = action;
    return state.setIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden'],
      !state.getIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden']));
  },
  [constants.CHANGE_INPUT_VISIBILITY]: function changeInputVisibility(state, action) {
    const { id } = action;
    return state.setIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden'],
      !state.getIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden']));
  },
  [constants.UPDATE_CELL_PAGERS]: function updateCellPagers(state, action) {
    const { id, pagers } = action;
    return state.setIn(['cellPagers', id], pagers);
  },
  [constants.UPDATE_CELL_STATUS]: function updateCellStatus(state, action) {
    const { id, status } = action;
    return state.setIn(['transient', 'cellMap', id, 'status'], status);
  },
  [constants.SET_LANGUAGE_INFO]: function setLanguageInfo(state, action) {
    const langInfo = Immutable.fromJS(action.langInfo);
    return state.setIn(['notebook', 'metadata', 'language_info'], langInfo);
  },
  [constants.SET_KERNEL_INFO]: function setKernelSpec(state, action) {
    const { kernelInfo } = action;
    return state
      .setIn(['notebook', 'metadata', 'kernelspec'], Immutable.fromJS({
        name: kernelInfo.name,
        language: kernelInfo.spec.language,
        display_name: kernelInfo.spec.display_name,
      }))
      .setIn(['notebook', 'metadata', 'kernel_info', 'name'], kernelInfo.name);
  },
  [constants.OVERWRITE_METADATA_FIELD]: function overwriteMetadata(state, action) {
    const { field, value } = action;
    return state.setIn(['notebook', 'metadata', field], Immutable.fromJS(value));
  },
  [constants.DELETE_METADATA_FIELD]: function deleteMetadata(state, action) {
    const { field } = action;
    return state.deleteIn(['notebook', 'metadata', field]);
  },
  [constants.COPY_CELL]: function copyCell(state, action) {
    const { id } = action;
    const cellMap = state.getIn(['notebook', 'cellMap']);
    const cell = cellMap.get(id);
    return state.set('copied', new Immutable.Map({ id, cell }));
  },
  [constants.CUT_CELL]: function cutCell(state, action) {
    const { id } = action;
    const cellMap = state.getIn(['notebook', 'cellMap']);
    const cell = cellMap.get(id);
    return state
      .set('copied', new Immutable.Map({ id, cell }))
      .update('notebook', notebook => commutable.removeCell(notebook, id));
  },
  [constants.PASTE_CELL]: function pasteCell(state) {
    const copiedCell = state.getIn(['copied', 'cell']);
    const copiedId = state.getIn(['copied', 'id']);
    const id = uuid.v4();

    return state.update('notebook', notebook =>
        commutable.insertCellAfter(notebook, copiedCell, id, copiedId))
          .setIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden'], false)
          .setIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden'], false);
  },
  [constants.CHANGE_CELL_TYPE]: function changeCellType(state, action) {
    const { id, to } = action;
    const from = state.getIn(['notebook', 'cellMap', id, 'cell_type']);

    if (from === to) {
      return state;
    } else if (from === 'markdown') {
      return state.setIn(['notebook', 'cellMap', id, 'cell_type'], to)
        .setIn(['notebook', 'cellMap', id, 'execution_count'], null)
        .setIn(['notebook', 'cellMap', id, 'outputs'], new Immutable.List());
    }

    return cleanCellTransient(state.setIn(['notebook', 'cellMap', id, 'cell_type'], to)
      .deleteIn(['notebook', 'cellMap', id, 'execution_count'])
      .deleteIn(['notebook', 'cellMap', id, 'outputs']),
      id);
  },
  [constants.TOGGLE_OUTPUT_EXPANSION]: function toggleOutputExpansion(state, action) {
    const { id } = action;
    return state.updateIn(['notebook', 'cellMap'], cells =>
      cells.setIn([id, 'metadata', 'outputExpanded'],
        !cells.getIn([id, 'metadata', 'outputExpanded'])));
  },
}, {});
