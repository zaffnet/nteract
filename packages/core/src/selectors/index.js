// @flow
import type { AppState } from "@nteract/types/core/records";

import { createSelector } from "reselect";

export const getHost = (state: AppState) => state.app.host;

export const getServerConfig = createSelector(getHost, host => ({
  endpoint: host.serverUrl,
  crossDomain: host.crossDomain,
  token: host.token
}));
