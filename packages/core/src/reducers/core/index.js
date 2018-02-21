// @flow
import { combineReducers } from "redux-immutable";
import { communication } from "./communication";
import { entities } from "./entities";
import { makeStateRecord } from "../../state";

const core = combineReducers(
  {
    communication,
    entities
  },
  makeStateRecord
);

export default core;
