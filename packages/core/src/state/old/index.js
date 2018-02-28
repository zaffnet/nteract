/* @flow */
import type { RecordFactory, RecordOf } from "immutable";
import type { Subject } from "rxjs";
import type {
  OldDesktopHostRecordProps,
  OldJupyterHostRecordProps
} from "./hosts";
import { emptyNotebook } from "@nteract/commutable";

import { List, Map, Record, Set } from "immutable";

type HostRecord = RecordOf<
  OldDesktopHostRecordProps | OldJupyterHostRecordProps
>;

export { makeOldDesktopHostRecord, makeOldJupyterHostRecord } from "./hosts";
export { makeModalsRecord } from "./modals";

import type { ModalsRecordProps } from "./modals";
export { ModalsRecordProps } from "./modals";

/*

This is the definition of JSON that Flow provides

type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

Which we'll adapt for our use of Immutable.js

*/
type ImmutableJSON =
  | string
  | number
  | boolean
  | null
  | ImmutableJSONMap
  | ImmutableJSONList; // eslint-disable-line no-use-before-define

type ImmutableJSONMap = Map<string, ImmutableJSON>;

type ImmutableJSONList = List<ImmutableJSON>;

type ExecutionCount = number | null;

type MimeBundle = Map<string, ImmutableJSON>;

type ExecuteResult = {
  output_type: "execute_result",
  execution_count: ExecutionCount,
  data: MimeBundle,
  metadata: ImmutableJSONMap
};

type DisplayData = {
  output_type: "display_data",
  data: MimeBundle,
  metadata: ImmutableJSONMap
};

type StreamOutput = {
  output_type: "stream",
  name: "stdout" | "stderr",
  text: string
};

type ErrorOutput = {
  output_type: "error",
  ename: string,
  evalue: string,
  traceback: List<string>
};

type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

type CodeCell = {
  cell_type: "code",
  metadata: ImmutableJSONMap,
  execution_count: ExecutionCount,
  source: string,
  outputs: List<Output>
};

type MarkdownCell = {
  cell_type: "markdown",
  source: string,
  metadata: ImmutableJSONMap
};

type Cell = MarkdownCell | CodeCell;

type KernelspecMetadata = {
  name: string,
  display_name: string,
  language: string
};

// Note: this is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
export type OldKernelInfo = {
  name: string,
  spec: KernelspecMetadata
};

export type OldLanguageInfoMetadata = {
  name: string,
  codemirror_mode?: string | ImmutableJSONMap,
  file_extension?: string,
  mimetype?: string,
  pygments_lexer?: string
};

export type NotebookMetadata = {
  kernelspec: KernelspecMetadata,
  language_info: OldLanguageInfoMetadata
  // NOTE: We're not currently using orig_nbformat in nteract. Based on the comment
  // in the schema, we won't:
  //
  //   > Original notebook format (major number) before converting the notebook between versions. This should never be written to a file
  //
  //   from https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L58-L61
  //
  // It seems like an intermediate/in-memory representation that bled its way into the spec, when it should have been
  // handled as separate state.
  //
  // orig_nbformat?: number,
};

export type DocumentRecordProps = {
  // TODO: This _needs_ to become a Record
  notebook: Map<string, any>,
  savedNotebook: Map<string, any>,
  filename: ?string,
  transient: Map<string, any>, // has the keypaths for updating displays
  // transient should be more fully typed (be a record itself)
  // right now it's keypaths and then it looks like it's able to handle any per
  // cell transient data that will be deleted when the kernel is restarted
  cellPagers: any,
  stickyCells: Set<any>,
  editorFocused: any,
  cellFocused: any,
  copied: Map<any, any>
};

export const makeDocumentRecord: RecordFactory<DocumentRecordProps> = Record({
  notebook: emptyNotebook,
  savedNotebook: emptyNotebook,
  transient: Map({
    keyPathsForDisplays: Map()
  }),
  cellPagers: Map(),
  stickyCells: Set(),
  editorFocused: null,
  cellFocused: null,
  copied: Map(),
  filename: ""
});

export type DocumentRecord = RecordOf<DocumentRecordProps>;

export type CommsRecordProps = {
  targets: Map<any, any>,
  info: Map<any, any>,
  models: Map<any, any>
};

export type CommsRecord = RecordOf<CommsRecordProps>;

export const makeCommsRecord = Record({
  targets: new Map(),
  info: new Map(),
  models: new Map()
});
