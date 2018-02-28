// @flow
import * as Immutable from "immutable";
import type { HostsRecordProps } from "./hosts";
import type { KernelspecsRecordProps } from "./kernelspecs";
import { makeHostsRecord } from "./hosts";
import { makeKernelspecsRecord } from "./kernelspecs";

export * from "./hosts";
export * from "./kernelspecs";

export type EntitiesRecordProps = {
  hosts: Immutable.RecordOf<HostsRecordProps>,
  kernelspecs: Immutable.RecordOf<KernelspecsRecordProps>
};

export const makeEntitiesRecord: Immutable.RecordFactory<
  EntitiesRecordProps
> = Immutable.Record({
  hosts: makeHostsRecord(),
  kernelspecs: makeKernelspecsRecord()
});
