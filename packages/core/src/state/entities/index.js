// @flow
import * as Immutable from "immutable";
import type { HostsRecordProps } from "./hosts";
import type { KernelsRecordProps } from "./kernels";
import type { KernelspecsRecordProps } from "./kernelspecs";
import { makeHostsRecord } from "./hosts";
import { makeKernelsRecord } from "./kernels";
import { makeKernelspecsRecord } from "./kernelspecs";

export * from "./hosts";
export * from "./kernels";
export * from "./kernelspecs";

export type EntitiesRecordProps = {
  hosts: Immutable.RecordOf<HostsRecordProps>,
  kernels: Immutable.RecordOf<KernelsRecordProps>,
  kernelspecs: Immutable.RecordOf<KernelspecsRecordProps>
};

export const makeEntitiesRecord: Immutable.RecordFactory<
  EntitiesRecordProps
> = Immutable.Record({
  hosts: makeHostsRecord(),
  kernels: makeKernelsRecord(),
  kernelspecs: makeKernelspecsRecord()
});
