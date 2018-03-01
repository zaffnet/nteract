// @flow
import * as Immutable from "immutable";
import type { HostId } from "../ids";
import type { HostRef } from "../refs";

export type BaseHostProps = {
  id: ?HostId,
  defaultKernelName: string
};

export type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean
};

export const makeJupyterHostRecord: Immutable.RecordFactory<
  JupyterHostRecordProps
> = Immutable.Record({
  type: "jupyter",
  id: null,
  defaultKernelName: "python",
  token: null,
  serverUrl: null,
  crossDomain: false
});

export type JupyterHostRecord = Immutable.RecordOf<JupyterHostRecordProps>;

export type BinderHostRecordProps = BaseHostProps & {
  // TODO: figure out if this belong here, it was brought over by play
  type: "binder",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean,
  messages: Immutable.List<string>
};

export const makeBinderHostRecord: Immutable.RecordFactory<
  BinderHostRecordProps
> = Immutable.Record({
  type: "binder",
  id: null,
  defaultKernelName: "python",
  token: null,
  serverUrl: null,
  crossDomain: false,
  messages: Immutable.List()
});

export type BinderHostRecord = Immutable.RecordOf<BinderHostRecordProps>;

export type LocalHostRecordProps = BaseHostProps & {
  type: "local"
};

export const makeLocalHostRecord: Immutable.RecordFactory<
  LocalHostRecordProps
> = Immutable.Record({
  type: "local",
  id: null,
  defaultKernelName: "python"
});

export type LocalHostRecord = Immutable.RecordOf<LocalHostRecordProps>;

export type HostRecordProps =
  | LocalHostRecordProps
  | JupyterHostRecordProps
  | BinderHostRecordProps;
export type HostRecord = LocalHostRecord | JupyterHostRecord | BinderHostRecord;

export type HostsRecordProps = {
  byRef: Immutable.Map<HostRef, HostRecord>,
  refs: Immutable.List<HostRef>
};

export const makeHostsRecord: Immutable.RecordFactory<
  HostsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map(),
  refs: Immutable.List()
});
