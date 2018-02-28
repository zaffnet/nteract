// @flow
import * as Immutable from "immutable";
import type { KernelspecsCommunicationRecordProps } from "./kernelspecs";
import { makeKernelspecsCommunicationRecord } from "./kernelspecs";

export * from "./kernelspecs";

export type CommunicationRecordProps = {
  kernelspecs: Immutable.RecordOf<KernelspecsCommunicationRecordProps>
};

export const makeCommunicationRecord: Immutable.RecordFactory<
  CommunicationRecordProps
> = Immutable.Record({
  kernelspecs: makeKernelspecsCommunicationRecord()
});
