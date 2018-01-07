// @flow
// The ID type is for external resources, e.g. with /api/kernels/9092-7679-9978-8822,
// 9092-7679-9978-8822 is the ID
opaque type ID = string;
// A ref is an internal ID, used for kernels, hosts, kernelspec collections, etc.
opaque type Ref = string;

import type { RecordFactory, RecordOf } from "immutable";
import { Record, List } from "immutable";

type BaseHostProps = {
  id: ?ID,
  ref: ?Ref,
  selectedKernelRef: ?Ref,
  kernelSpecsRef: ?Ref, // reference to a collection of kernelspecs
  defaultKernelName: ?string,
  // In the desktop case, this _should_ be only one, pending
  // kernel cleanup
  activeKernelRefs: List<ID>
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
