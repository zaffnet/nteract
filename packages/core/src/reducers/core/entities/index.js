// @flow
import { combineReducers } from "redux-immutable";
import { makeEntitiesRecord } from "../../../state/entities";
import { hosts } from "./hosts";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";
import { modals } from "./modals";

export const entities = combineReducers(
  {
    hosts,
    kernels,
    kernelspecs,
    modals
  },
  makeEntitiesRecord
);
