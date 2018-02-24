// @flow
import type { HostId } from "../state/ids";
import type { HostRef, KernelRef, KernelspecsRef } from "../state/refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record, List } from "immutable";
import { Subject } from "rxjs/Subject";

export type BaseHostProps = {
  id: ?HostId,
  ref: ?HostRef,
  selectedKernelRef: ?KernelRef,
  kernelspecsRef: ?KernelspecsRef, // reference to a collection of kernelspecs
  defaultKernelName: ?string,
  // In the desktop case, this _should_ be only one, pending
  // kernel cleanup
  activeKernelRefs: List<KernelRef>
};

export type JupyterHostRecordProps = BaseHostProps & {
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
  kernelspecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List(),
  token: null,
  serverUrl: null,
  crossDomain: false
});

export type JupyterHostRecord = RecordOf<JupyterHostRecordProps>;

export type BinderHostRecordProps = JupyterHostRecordProps & {
  // TODO: figure out if this belong here, it was brought over by play
  messages: List<string>
};

export type DesktopHostRecordProps = BaseHostProps & {
  type: "local"
};

export const makeDesktopHostRecord: RecordFactory<
  DesktopHostRecordProps
> = Record({
  type: "local",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelspecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List()
});

export type DesktopHostRecord = RecordOf<DesktopHostRecordProps>;
