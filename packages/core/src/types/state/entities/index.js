// @flow
import type { KernelspecsRecordProps } from "./kernelspecs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeKernelspecsRecord } from "./kernelspecs";

export type EntitiesRecordProps = {
  kernelspecs: RecordOf<KernelspecsRecordProps>
};

export const makeEntitiesRecord: RecordFactory<EntitiesRecordProps> = Record({
  kernelspecs: makeKernelspecsRecord()
});
