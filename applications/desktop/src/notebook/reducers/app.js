// @flow
import { remote } from "electron";

import { app } from "@nteract/core/reducers";

import {
  makeAppRecord,
  makeDesktopHostRecord,
  AppRecord
} from "@nteract/types/core/records";

export default function handleApp(
  state: AppRecord = makeAppRecord({
    host: makeDesktopHostRecord(),
    version: remote.app.getVersion()
  }),
  action: *
) {
  return app(state, action);
}
