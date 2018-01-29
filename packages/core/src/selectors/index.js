// @flow
import type { AppState } from "@nteract/types/core/records";

// TODO: This assumes a jupyter host for now
export const getServerConfig = (state: AppState) => ({
  endpoint: state.app.host.serverUrl,
  crossDomain: state.app.host.crossDomain,
  token: state.app.host.token
});
