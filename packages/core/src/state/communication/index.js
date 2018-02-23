// @flow
import type { KernelspecsCommunicationRecordProps } from "./kernelspecs";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeKernelspecsCommunicationRecord } from "./kernelspecs";

export * from "./kernelspecs";

export type CommunicationRecordProps = {
  kernelspecs: RecordOf<KernelspecsCommunicationRecordProps>
};

export const makeCommunicationRecord: RecordFactory<
  CommunicationRecordProps
> = Record({
  kernelspecs: makeKernelspecsCommunicationRecord()
});
