// @flow
import { remote } from "electron";

import { app } from "@nteract/core/reducers";

import {
  makeAppRecord,
  makeLocalKernelRecord,
  makeDesktopHostRecord,
  AppRecord
} from "@nteract/types/core/records";

import type {
  NewKernelAction,
  SetGithubTokenAction,
  KillKernelAction,
  DoneSavingConfigAction
} from "@nteract/core/actionTypes";

function setGithubToken(state: AppRecord, action: SetGithubTokenAction) {
  const { githubToken } = action;
  return state.set("githubToken", githubToken);
}

type AppAction = SetGithubTokenAction;

export default function handleApp(
  state: AppRecord = makeAppRecord({
    host: makeDesktopHostRecord(),
    version: remote.app.getVersion()
  }),
  action: AppAction
) {
  switch (action.type) {
    case "SET_GITHUB_TOKEN":
      return setGithubToken(state, action);
    default:
      // We defer to core for the rest as we move more into @nteract/core
      return app(state, action);
  }
}
