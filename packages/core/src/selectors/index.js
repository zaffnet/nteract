// @flow
import type { AppState } from "@nteract/types/core/records";

import { createSelector } from "reselect";

const serverUrl = (state: AppState) => state.app.host.serverUrl;
const crossDomain = (state: AppState) => state.app.host.crossDomain;
const token = (state: AppState) => state.app.host.token;

export const getServerConfig = createSelector(
  [serverUrl, crossDomain, token],
  (serverUrl, crossDomain, token) => ({
    endpoint: serverUrl,
    crossDomain,
    token
  })
);
