// @flow
import type { HostId, KernelId } from "../ids";
import type { HostRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

export type BaseHostProps = {
  id: ?HostId,
  defaultKernelName: string
};

export type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean,
  kernelIds: List<KernelId>
};

export const makeJupyterHostRecord: RecordFactory<
  JupyterHostRecordProps
> = Record({
  type: "jupyter",
  id: null,
  defaultKernelName: "python",
  kernelIds: List(),
  token: null,
  serverUrl: null,
  crossDomain: false
});

export type JupyterHostRecord = RecordOf<JupyterHostRecordProps>;

export type BinderHostRecordProps = BaseHostProps & {
  // TODO: figure out if this belong here, it was brought over by play
  type: "binder",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean,
  kernelIds: List<KernelId>,
  messages: List<string>
};

export const makeBinderHostRecord: RecordFactory<
  BinderHostRecordProps
> = Record({
  type: "binder",
  id: null,
  defaultKernelName: "python",
  kernelIds: List(),
  token: null,
  serverUrl: null,
  crossDomain: false,
  messages: List()
});

export type BinderHostRecord = RecordOf<BinderHostRecordProps>;

export type LocalHostRecordProps = BaseHostProps & {
  type: "local"
};

export const makeLocalHostRecord: RecordFactory<LocalHostRecordProps> = Record({
  type: "local",
  id: null,
  defaultKernelName: "python",
  kernelIds: List()
});

export type LocalHostRecord = RecordOf<LocalHostRecordProps>;

export type HostRecordProps =
  | LocalHostRecordProps
  | JupyterHostRecordProps
  | BinderHostRecordProps;
export type HostRecord = LocalHostRecord | JupyterHostRecord | BinderHostRecord;

export type HostsRecordProps = {
  byRef: Map<HostRef, HostRecord>,
  refs: List<HostRef>
};

export const makeHostsRecord: RecordFactory<HostsRecordProps> = Record({
  byRef: Map(),
  refs: List()
});
