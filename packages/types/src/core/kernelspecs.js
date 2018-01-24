// @flow
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";
import { v4 as uuid } from "uuid";

export opaque type KernelspecsRef = string;

export const createKernelspecsRef = (): KernelspecsRef => uuid();

type CommunicationKernelspecsProps = {
  loading: boolean,
  error: ?Object
};

export type CommunicationKernelspecs = RecordOf<CommunicationKernelspecsProps>;

export const makeCommunicationKernelspecs: RecordFactory<
  CommunicationKernelspecsProps
> = Record({
  loading: false,
  error: null
});

type KernelspecProps = {
  language: ?string,
  argv: List<string>,
  env: Map<string, *>
};

export type Kernelspec = RecordOf<KernelspecProps>;

export const makeKernelspec: RecordFactory<KernelspecProps> = Record({
  language: null,
  argv: List(),
  env: Map()
});

type KernelspecsProps = {
  name: ?string,
  resources: Map<string, *>,
  spec: RecordOf<KernelspecProps>
};

export type Kernelspecs = RecordOf<KernelspecsProps>;

export const makeKernelspecs: RecordFactory<KernelspecsProps> = Record({
  name: null,
  resources: Map(),
  spec: makeKernelspec()
});
