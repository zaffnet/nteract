// @flow
import { combineReducers } from "redux-immutable";
import { kernelspecs } from "./kernelspecs";
import { makeCommunicationRecord } from "../../../types/state/communication";

export const communication = combineReducers(
  {
    kernelspecs
  },
  makeCommunicationRecord
);
