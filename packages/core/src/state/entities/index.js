// @flow
import type { HostsRecordProps } from "./hosts";
import type { KernelspecsRecordProps } from "./kernelspecs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeHostsRecord } from "./hosts";
import { makeKernelspecsRecord } from "./kernelspecs";

export type EntitiesRecordProps = {
  hosts: RecordOf<HostsRecordProps>,
  kernelspecs: RecordOf<KernelspecsRecordProps>
};

export const makeEntitiesRecord: RecordFactory<EntitiesRecordProps> = Record({
  hosts: makeHostsRecord(),
  kernelspecs: makeKernelspecsRecord()
});
