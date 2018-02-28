// @flow
import * as Immutable from "immutable";
import type { ChildProcess } from "child_process";
import type { HostRef, KernelRef } from "../refs";
import type { KernelId } from "../ids";

export type BaseKernelProps = {
  name: ?string,
  kernelSpecName: ?string,
  hostRef: ?HostRef,
  lastActivity: ?Date,
  channels: ?rxjs$Subject<*, *>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string
};

export type LocalKernelProps = BaseKernelProps & {
  type: "zeromq",
  spawn: ?ChildProcess,
  connectionFile: ?string
};

export const makeLocalKernelRecord: Immutable.RecordFactory<
  LocalKernelProps
> = Immutable.Record({
  type: "zeromq",
  cwd: ".",
  kernelSpecName: null,
  hostRef: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null,
  spawn: null,
  connectionFile: null
});

export type LocalKernelRecord = Immutable.RecordOf<LocalKernelProps>;

export type RemoteKernelProps = BaseKernelProps & {
  type: "websocket",
  id: ?KernelId
};

export const makeRemoteKernelRecord: Immutable.RecordFactory<
  RemoteKernelProps
> = Immutable.Record({
  type: "websocket",
  cwd: ".",
  id: null,
  kernelSpecName: null,
  hostRef: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null
});

export type RemoteKernelRecord = Immutable.RecordOf<RemoteKernelProps>;

export type KernelRecord = LocalKernelRecord | RemoteKernelRecord;

export type KernelsRecordProps = {
  byRef: Immutable.Map<KernelRef, KernelRecord>
};

export const makeKernelsRecord: Immutable.RecordFactory<
  KernelsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
