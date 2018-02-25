// @flow
import type { ChildProcess } from "child_process";
import type { KernelId } from "../ids";
import type { KernelRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { Subject } from "rxjs/Subject";

export type RemoteKernelProps = {
  type: "websocket",
  id: ?KernelId,
  ref: ?KernelRef,
  kernelSpecName: ?string,
  lastActivity: ?Date,
  channels: rxjs$Subject<*>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string
};

export type LocalKernelProps = {
  type: "zeromq",
  spawn: ?ChildProcess,
  connectionFile: ?string,
  ref: ?KernelRef,
  kernelSpecName: ?string,
  lastActivity: ?Date,
  channels: rxjs$Subject<*>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string
};

export const makeLocalKernelRecord: RecordFactory<LocalKernelProps> = Record({
  type: "zeromq",
  spawn: null,
  connectionFile: null,
  ref: null,
  kernelSpecName: null,
  lastActivity: null,
  channels: new Subject(),
  cwd: ".",
  status: null
});

export const makeRemoteKernelRecord: RecordFactory<RemoteKernelProps> = Record({
  type: "websocket",
  cwd: ".",
  id: null,
  ref: null,
  kernelSpecName: null,
  lastActivity: null,
  channels: new Subject(),
  status: null
});

export type LocalKernelRecord = RecordOf<LocalKernelProps>;
export type RemoteKernelRecord = RecordOf<RemoteKernelProps>;
