// @flow
import { shutdownKernel } from "../kernel/shutdown";

import {
  makeAppRecord,
  makeLocalKernelRecord,
  makeDesktopHostRecord,
  AppRecord
} from "@nteract/types/core/records";

import type {
  NewKernelAction,
  SetGithubTokenAction,
  SetNotificationSystemAction,
  SetExecutionStateAction,
  ExitAction,
  StartSavingAction,
  InterruptKernelAction,
  KillKernelAction,
  DoneSavingAction,
  DoneSavingConfigAction
} from "@nteract/core/actionTypes";

function cleanupKernel(state: AppRecord): AppRecord {
  shutdownKernel(state.kernel);

  return state.withMutations((ctx: AppRecord) =>
    ctx
      .set("kernel", null)
      .set("kernelSpecName", null)
      .set("kernelSpecDisplayName", null)
      .set("kernelSpec", null)
      .set("executionState", "not connected")
  );
}

function newKernel(state: AppRecord, action: NewKernelAction) {
  const kernel = makeLocalKernelRecord({
    channels: action.channels,
    spawn: action.spawn,
    connectionFile: action.connectionFile
  });

  return cleanupKernel(state).withMutations((ctx: AppRecord) =>
    ctx
      .set("kernel", kernel)
      .set("kernelSpecName", action.kernelSpecName)
      .set("kernelSpecDisplayName", action.kernelSpec.spec.display_name)
      .set("kernelSpec", action.kernelSpec)
      .set("executionState", "starting")
  );
}
function exit(state: AppRecord) {
  return cleanupKernel(state);
}

function interruptKernel(state: AppRecord) {
  state.kernel.spawn.kill("SIGINT");
  return state;
}

function startSaving(state: AppRecord) {
  return state.set("isSaving", true);
}

function setExecutionState(state: AppRecord, action: SetExecutionStateAction) {
  return state.set("executionState", action.executionState);
}

function doneSaving(state: AppRecord) {
  return state.set("isSaving", false).set("lastSaved", new Date());
}

function doneSavingConfig(state: AppRecord) {
  return state.set("configLastSaved", new Date());
}

function setNotificationsSystem(
  state: AppRecord,
  action: SetNotificationSystemAction
) {
  return state.set("notificationSystem", action.notificationSystem);
}

function setGithubToken(state: AppRecord, action: SetGithubTokenAction) {
  const { githubToken } = action;
  return state.set("githubToken", githubToken);
}

type AppAction =
  | NewKernelAction
  | SetGithubTokenAction
  | SetNotificationSystemAction
  | SetExecutionStateAction
  | ExitAction
  | StartSavingAction
  | InterruptKernelAction
  | KillKernelAction
  | DoneSavingAction
  | DoneSavingConfigAction;

export default function handleApp(
  state: AppRecord = makeAppRecord({
    host: makeDesktopHostRecord()
  }),
  action: AppAction
) {
  switch (action.type) {
    case "NEW_KERNEL":
      return newKernel(state, action);
    case "EXIT":
      return exit(state);
    case "KILL_KERNEL":
      return cleanupKernel(state);
    case "INTERRUPT_KERNEL":
      return interruptKernel(state);
    case "START_SAVING":
      return startSaving(state);
    case "SET_EXECUTION_STATE":
      return setExecutionState(state, action);
    case "DONE_SAVING":
      return doneSaving(state);
    case "DONE_SAVING_CONFIG":
      return doneSavingConfig(state);
    case "SET_NOTIFICATION_SYSTEM":
      return setNotificationsSystem(state, action);
    case "SET_GITHUB_TOKEN":
      return setGithubToken(state, action);
    default:
      return state;
  }
}
