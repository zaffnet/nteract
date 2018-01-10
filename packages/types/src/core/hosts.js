// @flow
import type { ChildProcess } from "child_process";

// The Id type is for external resources, e.g. with /api/kernels/9092-7679-9978-8822,
// 9092-7679-9978-8822 is the Id
opaque type Id = string;
// A ref is an internal Id, used for kernels, hosts, kernelspec collections, etc.
opaque type Ref = string;

opaque type KernelRef = Ref;
opaque type HostRef = Ref;
opaque type KernelSpecsRef = Ref;

import type { RecordFactory, RecordOf } from "immutable";
import { Record, List } from "immutable";

type BaseHostProps = {
  id: ?Id,
  ref: ?HostRef,
  selectedKernelRef: ?KernelRef,
  kernelSpecsRef: ?KernelSpecsRef, // reference to a collection of kernelspecs
  defaultKernelName: ?string,
  // In the desktop case, this _should_ be only one, pending
  // kernel cleanup
  activeKernelRefs: List<Id>
};

type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean
};

export const makeJupyterHostRecord: RecordFactory<
  JupyterHostRecordProps
> = Record({
  type: "jupyter",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelSpecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List(),
  token: null,
  serverUrl: null,
  crossDomain: false
});

export type JupyterHostRecord = RecordOf<JupyterHostRecordProps>;

type BinderHostRecordProps = JupyterHostRecordProps & {
  // TODO: figure out if this belong here, it was brought over by play
  messages: List<string>
};

type DesktopHostRecordProps = BaseHostProps & {
  type: "local"
};

export const makeDesktopHostRecord: RecordFactory<
  DesktopHostRecordProps
> = Record({
  type: "local",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelSpecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List()
});

export type DesktopHostRecord = RecordOf<DesktopHostRecordProps>;

type BaseKernelProps = {
  ref: KernelRef,
  name: string,
  lastActivity: Date,
  channels: rxjs$Subject<*, *>,
  status: string
};

type RemoteKernelProps = BaseKernelProps & {
  id: Id
};

type LocalKernelProps = BaseKernelProps & {
  spawn: ChildProcess,
  connectionFile: string
};
