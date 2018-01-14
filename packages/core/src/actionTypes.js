/* @flow */

import type {
  ImmutableCell,
  ImmutableNotebook,
  CellID,
  CellType,
  ImmutableCellOrder,
  ImmutableOutput,
  ImmutableOutputs,
  MimeBundle
} from "@nteract/types/commutable";

import type {
  LanguageInfoMetadata,
  KernelInfo,
  DocumentRecord
} from "@nteract/types/core/records";

import type { ExecuteRequest } from "@nteract/types/messaging";

import type { Output, StreamOutput } from "@nteract/commutable/src/v4";

export const CHANGE_FILENAME = "CHANGE_FILENAME";
export type ChangeFilenameAction = {
  type: "CHANGE_FILENAME",
  filename: string
};

// TODO: Relocate the action type from desktop's app.js
export const START_SAVING = "START_SAVING";

// TODO: Is there a name mismatch here?
export const DONE_SAVING = "DONE_SAVING";
export type SetNotebookCheckpointAction = {
  type: "DONE_SAVING",
  notebook: ImmutableNotebook
};

// TODO: Properly type these ERROR action types
export const ERROR_UPDATE_DISPLAY = "ERROR_UPDATE_DISPLAY";
export const ERROR_EXECUTING = "ERROR_EXECUTING";
export const ERROR_KERNEL_LAUNCH_FAILED = "ERROR_KERNEL_LAUNCH_FAILED";
export const COMM_ERROR = "COMM_ERROR";

// TODO: Properly type this action type, which is consumed only by epics
export const LAUNCH_KERNEL = "LAUNCH_KERNEL";

// TODO: Properly type this action type, which is consumed only by epics
export const LAUNCH_KERNEL_BY_NAME = "LAUNCH_KERNEL_BY_NAME";

// TODO: Properly type this action type, which is consumed only by epics
export const NEW_KERNEL = "NEW_KERNEL";

// TODO: Properly type this action type, which is consumed only by epics
export const KILL_KERNEL = "KILL_KERNEL";

// TODO: Properly type this action type, which is consumed only by epics
export const INTERRUPT_KERNEL = "INTERRUPT_KERNEL";

// TODO: Properly type this action type, which is consumed only by epics
export const EXIT = "EXIT";

export const SET_IN_CELL = "SET_IN_CELL";
export type SetInCellAction = {
  type: "SET_IN_CELL",
  id: CellID,
  path: Array<string>,
  value: any
};

// TODO: Make this action JSON serializable (don't use the Immutable.js version
//       of the notebook in this action)
export const SET_NOTEBOOK = "SET_NOTEBOOK";
export type SetNotebookAction = {
  type: "SET_NOTEBOOK",
  notebook: ImmutableNotebook,
  filename?: string
};

export const MOVE_CELL = "MOVE_CELL";
export type MoveCellAction = {
  type: "MOVE_CELL",
  id: CellID,
  destinationId: CellID
};

export const REMOVE_CELL = "REMOVE_CELL";
export type RemoveCellAction = { type: "REMOVE_CELL", id: CellID };

// TODO: Properly type this action type, which is consumed only by epics
export const NEW_NOTEBOOK = "NEW_NOTEBOOK";

// TODO: Delete unused action
export const READ_NOTEBOOK = "READ_NOTEBOOK";

export const NEW_CELL_AFTER = "NEW_CELL_AFTER";
export type NewCellAfterAction = {
  type: "NEW_CELL_AFTER",
  id: CellID,
  cellType: CellType,
  source: string
};

export const NEW_CELL_BEFORE = "NEW_CELL_BEFORE";
export type NewCellBeforeAction = {
  type: "NEW_CELL_BEFORE",
  cellType: CellType,
  id: CellID
};

export const NEW_CELL_APPEND = "NEW_CELL_APPEND";
export type NewCellAppendAction = {
  type: "NEW_CELL_APPEND",
  cellType: CellType
};

export const MERGE_CELL_AFTER = "MERGE_CELL_AFTER";
export type MergeCellAfterAction = { type: "MERGE_CELL_AFTER", id: CellID };

// TODO: This needs a proper flow type, is only consumed by the epics
export const ABORT_EXECUTION = "ABORT_EXECUTION";

// TODO: Delete this unused action type (we now defer to SET_IN_CELL)
export const UPDATE_CELL_EXECUTION_COUNT = "UPDATE_CELL_EXECUTION_COUNT";

export const APPEND_OUTPUT = "APPEND_OUTPUT";
export type AppendOutputAction = {
  type: "APPEND_OUTPUT",
  id: CellID,
  output: Output
};

export const UPDATE_DISPLAY = "UPDATE_DISPLAY";
export type UpdateDisplayAction = { type: "UPDATE_DISPLAY", output: Output };

// TODO: Rename this TOGGLE_OUTPUT_VISIBILITY
export const CHANGE_OUTPUT_VISIBILITY = "CHANGE_OUTPUT_VISIBILITY";
export type ChangeOutputVisibilityAction = {
  type: "CHANGE_OUTPUT_VISIBILITY",
  id: CellID
};

// TODO: Rename this TOGGLE_INPUT_VISIBILITY
export const CHANGE_INPUT_VISIBILITY = "CHANGE_INPUT_VISIBILITY";
export type ChangeInputVisibilityAction = {
  type: "CHANGE_INPUT_VISIBILITY",
  id: CellID
};

export const CLEAR_OUTPUTS = "CLEAR_OUTPUTS";
export type ClearOutputsAction = { type: "CLEAR_OUTPUTS", id: CellID };

export const ACCEPT_PAYLOAD_MESSAGE_ACTION = "ACCEPT_PAYLOAD_MESSAGE_ACTION";
export type AcceptPayloadMessageAction = {
  type: "ACCEPT_PAYLOAD_MESSAGE_ACTION",
  id: CellID,
  payload: *
};

export const SET_LANGUAGE_INFO = "SET_LANGUAGE_INFO";
export type SetLanguageInfoAction = {
  type: "SET_LANGUAGE_INFO",
  langInfo: LanguageInfoMetadata
};

export const SEND_EXECUTE_REQUEST = "SEND_EXECUTE_REQUEST";
export type SendExecuteMessageAction = {
  type: "SEND_EXECUTE_REQUEST",
  id: CellID,
  message: ExecuteRequest
};

// TODO: Relocate the action type from desktop's app.js
export const SET_EXECUTION_STATE = "SET_EXECUTION_STATE";

export const FOCUS_CELL = "FOCUS_CELL";
export type FocusCellAction = { type: "FOCUS_CELL", id: CellID };

export const FOCUS_NEXT_CELL = "FOCUS_NEXT_CELL";
export type FocusNextCellAction = {
  type: "FOCUS_NEXT_CELL",
  id: CellID,
  createCellIfUndefined: boolean
};

export const FOCUS_PREVIOUS_CELL = "FOCUS_PREVIOUS_CELL";
export type FocusPreviousCellAction = {
  type: "FOCUS_PREVIOUS_CELL",
  id: CellID
};

export const FOCUS_CELL_EDITOR = "FOCUS_CELL_EDITOR";
export type FocusCellEditorAction = {
  type: "FOCUS_CELL_EDITOR",
  id: CellID | null
};

export const FOCUS_NEXT_CELL_EDITOR = "FOCUS_NEXT_CELL_EDITOR";
export type FocusNextCellEditorAction = {
  type: "FOCUS_NEXT_CELL_EDITOR",
  id: CellID
};

export const FOCUS_PREVIOUS_CELL_EDITOR = "FOCUS_PREVIOUS_CELL_EDITOR";
export type FocusPreviousCellEditorAction = {
  type: "FOCUS_PREVIOUS_CELL_EDITOR",
  id: CellID
};

export const TOGGLE_STICKY_CELL = "TOGGLE_STICKY_CELL";
export type ToggleStickyCellAction = { type: "TOGGLE_STICKY_CELL", id: CellID };

export const SET_KERNEL_INFO = "SET_KERNEL_INFO";
export type SetKernelInfoAction = {
  type: "SET_KERNEL_INFO",
  kernelInfo: KernelInfo
};

export const OVERWRITE_METADATA_FIELD = "OVERWRITE_METADATA_FIELD";
export type OverwriteMetadataFieldAction = {
  type: "OVERWRITE_METADATA_FIELD",
  field: string,
  value: any
};

export const DELETE_METADATA_FIELD = "DELETE_METADATA_FIELD";
export type DeleteMetadataFieldAction = {
  type: "DELETE_METADATA_FIELD",
  field: string
};

export const STARTED_UPLOADING = "STARTED_UPLOADING";
export const DONE_UPLOADING = "DONE_UPLOADING";

// TODO: Relocate the action type from desktop's app.js
export const SET_NOTIFICATION_SYSTEM = "SET_NOTIFICATION_SYSTEM";

export const UPDATE_CELL_STATUS = "UPDATE_CELL_STATUS";
export type UpdateCellStatusAction = {
  type: "UPDATE_CELL_STATUS",
  id: CellID,
  status: string
};

export const SET_MODIFIED = "SET_MODIFIED";

export const SET_THEME = "SET_THEME";

export const PUBLISH_USER_GIST = "PUBLISH_USER_GIST";
export const PUBLISH_ANONYMOUS_GIST = "PUBLISH_ANONYMOUS_GIST";

export const SET_GITHUB_TOKEN = "SET_GITHUB_TOKEN";

export const REGISTER_COMM_TARGET = "REGISTER_COMM_TARGET";
export type RegisterCommTargetAction = {
  type: "REGISTER_COMM_TARGET",
  name: string,
  handler: string
};

export const COMM_OPEN = "COMM_OPEN";

export type CommOpenAction = {
  type: "COMM_OPEN",
  target_name: string,
  target_module: string,
  data: any,
  comm_id: string
};

export const COMM_MESSAGE = "COMM_MESSAGE";
export type CommMessageAction = {
  type: "COMM_MESSAGE",
  data: any,
  comm_id: string
};

export const SET_CONFIG_KEY = "SET_CONFIG_KEY";
export type SetConfigAction = {
  type: "SET_CONFIG_KEY",
  key: string,
  value: string
};

export const MERGE_CONFIG = "MERGE_CONFIG";
export type MergeConfigAction = { type: "MERGE_CONFIG", config: Map<any, any> };

// TODO: Relocate the action type from desktop's config.js
export const DONE_SAVING_CONFIG = "DONE_SAVING_CONFIG";

export const TOGGLE_OUTPUT_EXPANSION = "TOGGLE_OUTPUT_EXPANSION";
export type ToggleCellExpansionAction = {
  type: "TOGGLE_OUTPUT_EXPANSION",
  id: CellID
};

export const CUT_CELL = "CUT_CELL";
export type CutCellAction = { type: "CUT_CELL", id: CellID };

export const COPY_CELL = "COPY_CELL";
export type CopyCellAction = { type: "COPY_CELL", id: CellID };

export const PASTE_CELL = "PASTE_CELL";
export type PasteCellAction = { type: "PASTE_CELL" };

export const CHANGE_CELL_TYPE = "CHANGE_CELL_TYPE";
export type ChangeCellTypeAction = {
  type: "CHANGE_CELL_TYPE",
  id: CellID,
  to: string
};

// TODO: Relocate the action type from desktop's app.js
export const SAVE = "SAVE";
// TODO: Relocate the action type from desktop's app.js
export const SAVE_AS = "SAVE_AS";

// TODO: Relocate the action type from desktop's app.js
export const LOAD = "LOAD";

// TODO: Relocate the action type from desktop's config.js
export const LOAD_CONFIG = "LOAD_CONFIG";
// TODO: Relocate the action type from desktop's config.js
export const SAVE_CONFIG = "SAVE_CONFIG";

// TODO: Properly type this action type, which is only produced, never consumed
export const KERNEL_RAW_STDOUT = "KERNEL_RAW_STDOUT";
// TODO: Properly type this action type, which is only produced, never consumed
export const KERNEL_RAW_STDERR = "KERNEL_RAW_STDERR";
