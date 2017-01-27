/* @flow */

/*
 * Functions in this module are provided for converting from Jupyter Notebook
 * Format v4 to nteract's in-memory format, affectionately referred to as
 * commutable.
 *
 * See: https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json
 *
 * The main goal here is consistency and compliance with the v4 spec. The types
 * contained in here (non Immutable ones) are constrained to the disk based
 * notebook format.
 *
 * To assist in the developer experience, types are included through the use of
 * flow.
 *
 */

import * as Immutable from 'immutable';

import type {
  JSONObject,
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableMimeBundle,
} from './types';

import type {
  CellStructure,
} from './structures';

import { appendCell } from './structures';

export type ExecutionCount = number | null;

//
// MimeBundle example (disk format)
//
// {
//   "application/json": {"a": 3, "b": 2},
//   "text/html": ["<p>\n", "Hey\n", "</p>"],
//   "text/plain": "Hey"
// }
//
export type MimeBundle = { [key:string]: string | Array<string> | Object };

// On disk multi-line strings are used to accomodate line-by-line diffs in tools
// like git and GitHub. They get converted to strings for the in-memory format.
export type MultiLineString = string | Array<string>;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                             Output Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type ExecuteResult = {|
  output_type: 'execute_result',
  execution_count: ExecutionCount,
  data: MimeBundle,
  metadata: JSONObject,
|}

export type DisplayData = {|
  output_type: 'display_data',
  data: MimeBundle,
  metadata: JSONObject,
|}

export type StreamOutput = {|
  output_type: 'stream',
  name: 'stdout' | 'stderr',
  text: MultiLineString,
|}

export type ErrorOutput = {|
  output_type: 'error',
  ename: string,
  evalue: string,
  traceback: Array<string>,
|}

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                              Cell Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type CodeCell = {|
  cell_type: 'code',
  metadata: JSONObject,
  execution_count: ExecutionCount,
  source: string,
  outputs: Array<Output>,
|};

export type MarkdownCell = {|
  cell_type: 'markdown',
  metadata: JSONObject,
  source: MultiLineString,
|};

export type RawCell = {|
  cell_type: 'raw',
  metadata: JSONObject,
  source: MultiLineString,
|};

// TODO: RawCell
export type Cell = CodeCell | MarkdownCell | RawCell;

export type Notebook = {|
  cells: Array<Cell>,
  metadata: Object,
  nbformat: 4,
  nbformat_minor: number,
|};

function demultiline(s: string | Array<string>) {
  if (Array.isArray(s)) {
    return s.join('');
  }
  return s;
}

function cleanMimeData(key: string, data: string | Array<string> | Object) {
  // See https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L368
  if (/^application\/(.*\\+)?json$/.test(key)) {
    // Data stays as is for JSON types
    return data;
  }

  if (typeof data === 'string' || Array.isArray(data)) {
    return demultiline(data);
  }

  throw new TypeError(`Data for ${key} is expected to be a string or an Array of strings`);
}

function cleanMimeAtKey(mimeBundle: MimeBundle, previous: ImmutableMimeBundle, key: string) {
  return previous.set(key, cleanMimeData(key, mimeBundle[key]));
}

export function createImmutableMimeBundle(mimeBundle: MimeBundle): ImmutableMimeBundle {
  // Map over all the mimetypes, turning them into our in-memory format
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": ["<p>\n", "Hey\n", "</p>"],
  //   "text/plain": "Hey"
  // }
  //
  // to
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": "<p>\nHey\n</p>",
  //   "text/plain": "Hey"
  // }
  //
  return Object.keys(mimeBundle)
      .reduce(cleanMimeAtKey.bind(null, mimeBundle), Immutable.Map());
}


function createImmutableOutput(output: Output): ImmutableOutput {
  switch (output.output_type) {
    case 'execute_result':
      return Immutable.Map({
        output_type: output.output_type,
        execution_count: output.execution_count,
        data: createImmutableMimeBundle(output.data),
        metadata: Immutable.fromJS(output.metadata), // TODO: Determine if this should be Immutable or just frozen
      });
    case 'display_data':
      return Immutable.Map({
        output_type: output.output_type,
        data: createImmutableMimeBundle(output.data),
        metadata: Immutable.fromJS(output.metadata), // TODO: Determine if this should be Immutable or just frozen
      });
    case 'stream':
      return Immutable.Map({
        output_type: output.output_type,
        name: output.name,
        text: demultiline(output.text),
      });
    case 'error':
      // Note: this is one of the cases where the Array of strings (for traceback)
      // is part of the format, not a multiline string
      return Immutable.fromJS(output);
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
}

function createImmutableRawCell(cell: RawCell): ImmutableRawCell {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata),
  });
}

function createImmutableMarkdownCell(cell: MarkdownCell): ImmutableMarkdownCell {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata), // TODO: Determine if this should be Immutable or just frozen
  });
}

function createImmutableCodeCell(cell: CodeCell): ImmutableCodeCell {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    outputs: new Immutable.List(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.execution_count,
    metadata: Immutable.fromJS(cell.metadata), // TODO: Determine if this should be Immutable or just frozen
  });
}

function createImmutableCell(cell: Cell): ImmutableCell {
  switch (cell.cell_type) {
    case 'markdown':
      return createImmutableMarkdownCell(cell);
    case 'code':
      return createImmutableCodeCell(cell);
    case 'raw':
      return createImmutableRawCell(cell);
    default:
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}

export function fromJS(notebook: Notebook): ImmutableNotebook {
  if (notebook.nbformat !== 4 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v4 notebook. v4 notebooks must be of form 4.x
       It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
     );
  }

  // Since we're doing N cell operations all at once, switch to mutable then
  // switch back after.
  const starterCellStructure = {
    cellOrder: Immutable.List().asMutable(),
    cellMap: Immutable.Map().asMutable(),
  };

  const cellStructure = notebook.cells.reduce(
    (cellStruct: CellStructure, cell: Cell) =>
      appendCell(cellStruct, createImmutableCell(cell)),
    starterCellStructure);

  return Immutable.Map({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: Immutable.fromJS(notebook.metadata), // TODO: Determine if this should be Immutable or just frozen
  });
}
