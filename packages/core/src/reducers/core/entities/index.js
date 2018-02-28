// @flow
import { combineReducers } from "redux-immutable";
import { makeEntitiesRecord } from "../../../state/entities";
import { hosts } from "./hosts";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";

export const entities = combineReducers(
  {
    hosts,
    kernels,
    kernelspecs
  },
  makeEntitiesRecord
);
