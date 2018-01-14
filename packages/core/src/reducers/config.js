/* @flow */

import { Map } from "immutable";

import type { SetConfigAction, MergeConfigAction } from "../actionTypes";

type ConfigAction = SetConfigAction | MergeConfigAction;

type ConfigState = Map<any, any>;

export function setConfigKey(state: ConfigState, action: SetConfigAction) {
  const { key, value } = action;
  return state.set(key, value);
}

export function mergeConfig(state: ConfigState, action: MergeConfigAction) {
  const { config } = action;
  return state.merge(config);
}

export default function handleConfig(
  state: ConfigState = Map(),
  action: ConfigAction
) {
  switch (action.type) {
    case "SET_CONFIG_KEY":
      return setConfigKey(state, action);
    case "MERGE_CONFIG":
      return mergeConfig(state, action);
    default:
      (action: empty);
      return state;
  }
}
