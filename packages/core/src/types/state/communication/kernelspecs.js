// @flow
import type { KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Map, Record } from "immutable";

export type KernelspecsByRefCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeKernelspecsByRefCommunicationRecord: RecordFactory<
  KernelspecsByRefCommunicationRecordProps
> = Record({
  loading: false,
  error: null
});

export type KernelspecsCommunicationRecordProps = {
  byRef: Map<KernelspecsRef, RecordOf<KernelspecsByRefCommunicationRecordProps>>
};

export const makeKernelspecsCommunicationRecord: RecordFactory<
  KernelspecsCommunicationRecordProps
> = Record({
  byRef: Map()
});
