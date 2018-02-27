// @flow
import type { CommunicationRecordProps } from "./communication";
import type { EntitiesRecordProps } from "./entities";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord } from "./entities";

import * as Immutable from "immutable";

export * from "./communication";
export * from "./entities";
export * from "./ids";
export * from "./refs";
export * from "./old";

import type {
  AppRecordProps,
  DocumentRecordProps,
  CommsRecordProps,
  ModalsRecordProps
} from "./old";

export type ConfigState = Immutable.Map<string, any>;

export type StateRecordProps = {
  communication: RecordOf<CommunicationRecordProps>,
  entities: RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: RecordFactory<StateRecordProps> = Record({
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});

export type AppState = {
  app: RecordOf<AppRecordProps>,
  document: RecordOf<DocumentRecordProps>,
  comms: RecordOf<CommsRecordProps>,
  config: ConfigState,
  core: RecordOf<StateRecordProps>,
  modals: RecordOf<ModalsRecordProps>
};
