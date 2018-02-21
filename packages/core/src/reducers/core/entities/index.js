// @flow
import { combineReducers } from "redux-immutable";
import { makeEntitiesRecord } from "../../../state/entities";
import { hosts } from "./hosts";
import { kernelspecs } from "./kernelspecs";

export const entities = combineReducers(
  {
    hosts,
    kernelspecs
  },
  makeEntitiesRecord
);
