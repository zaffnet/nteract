// @flow
import { combineReducers } from "redux-immutable";
import { makeEntitiesRecord } from "../../../types/state/entities";
import { kernelspecs } from "./kernelspecs";

export const entities = combineReducers(
  {
    kernelspecs
  },
  makeEntitiesRecord
);
