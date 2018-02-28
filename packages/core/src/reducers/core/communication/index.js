// @flow
import { combineReducers } from "redux-immutable";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";
import { makeCommunicationRecord } from "../../../state/communication";

export const communication = combineReducers(
  {
    kernels,
    kernelspecs
  },
  makeCommunicationRecord
);
