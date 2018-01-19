import type { RecordFactory, RecordOf } from "immutable";
import type { Ref } from "./ref";
import { List, Map, Record } from "immutable";

export opaque type KernelspecsRef = Ref;

type CommunicationKernelspecsProps = {
  loading: boolean,
  error: ?Object
};

export type CommunicationKernelspecsRecord = RecordOf<
  CommunicationKernelspecsProps
>;

export const communicationKernelspecsFactory: RecordFactory<
  CommunicationKernelspecsProps
> = Record({
  loading: false,
  error: null
});

type EntitiesKernelspecsSpecProps = {
  language: string,
  argv: List<string>,
  env: Map
};

export type EntitiesKernelspecsSpecRecord = RecordOf<
  EntitiesKernelspecsSpecProps
>;

export const entitiesKernelspecsSpecFactory: RecordFactory<
  EntitiesKernelspecsSpecProps
> = Record({
  language: "", // TODO: what's a reasonable default?
  argv: List(),
  env: Map()
});

type EntitiesKernelspecsProps = {
  name: string,
  resources: Map,
  spec: RecordOf<EntitiesKernelspecsSpecProps>
};

export type EntitiesKernelspecsRecord = RecordOf<EntitiesKernelspecsProps>;

export const entitiesKernelspecsFactory: RecordFactory<
  EntitiesKernelspecsProps
> = Record({
  name: "", // TODO: what's a reasonable default?
  resources: Map(),
  spec: entitiesKernelspecsSpecFactory()
});
