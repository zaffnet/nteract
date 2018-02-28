// @flow
import * as Immutable from "immutable";
import type { KernelsCommunicationRecordProps } from "./kernels";
import type { KernelspecsCommunicationRecordProps } from "./kernelspecs";
import { makeKernelsCommunicationRecord } from "./kernels";
import { makeKernelspecsCommunicationRecord } from "./kernelspecs";

export * from "./kernels";
export * from "./kernelspecs";

export type CommunicationRecordProps = {
  kernels: Immutable.RecordOf<KernelsCommunicationRecordProps>,
  kernelspecs: Immutable.RecordOf<KernelspecsCommunicationRecordProps>
};

export const makeCommunicationRecord: Immutable.RecordFactory<
  CommunicationRecordProps
> = Immutable.Record({
  kernels: makeKernelsCommunicationRecord(),
  kernelspecs: makeKernelspecsCommunicationRecord()
});
