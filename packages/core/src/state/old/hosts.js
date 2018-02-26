// @flow
import type { HostId } from "../ids";
import type { HostRef, KernelRef, KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record, List } from "immutable";
import { Subject } from "rxjs/Subject";

export type OldBaseHostProps = {
  id: ?HostId,
  ref: ?HostRef,
  selectedKernelRef: ?KernelRef,
  kernelspecsRef: ?KernelspecsRef, // reference to a collection of kernelspecs
  defaultKernelName: ?string,
  // In the desktop case, this _should_ be only one, pending
  // kernel cleanup
  activeKernelRefs: List<KernelRef>
};

export type OldJupyterHostRecordProps = OldBaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean
};

export const makeOldJupyterHostRecord: RecordFactory<
  OldJupyterHostRecordProps
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

export type OldJupyterHostRecord = RecordOf<OldJupyterHostRecordProps>;

export type OldBinderHostRecordProps = OldJupyterHostRecordProps & {
  // TODO: figure out if this belong here, it was brought over by play
  messages: List<string>
};

export type OldDesktopHostRecordProps = OldBaseHostProps & {
  type: "local"
};

export const makeOldDesktopHostRecord: RecordFactory<
  OldDesktopHostRecordProps
> = Record({
  type: "local",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelspecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List()
});

export type OldDesktopHostRecord = RecordOf<OldDesktopHostRecordProps>;
