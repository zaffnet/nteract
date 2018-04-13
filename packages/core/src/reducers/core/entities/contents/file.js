// @flow

import * as uuid from "uuid";

import * as actionTypes from "../../../../actionTypes";

import * as Immutable from "immutable";

import { has } from "lodash";

import type { FileContentRecord } from "../../../../state/entities/contents";

function updateFileText(
  state: FileContentRecord,
  action: actionTypes.UpdateFileText
) {
  return state.set("text", action.payload.text);
}

type FileAction = actionTypes.UpdateFileText;

export function file(state: FileContentRecord, action: FileAction) {
  switch (action.type) {
    case actionTypes.UPDATE_FILE_TEXT:
      return updateFileText(state, action);
    default:
      (action: empty);
      return state;
  }
}
