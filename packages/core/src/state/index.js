// @flow
import * as Immutable from "immutable";
import type { CommunicationRecordProps } from "./communication";
import type { EntitiesRecordProps } from "./entities";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord } from "./entities";

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
  communication: Immutable.RecordOf<CommunicationRecordProps>,
  entities: Immutable.RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: Immutable.RecordFactory<
  StateRecordProps
> = Immutable.Record({
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});

export type AppState = {
  app: Immutable.RecordOf<AppRecordProps>,
  document: Immutable.RecordOf<DocumentRecordProps>,
  comms: Immutable.RecordOf<CommsRecordProps>,
  config: ConfigState,
  core: Immutable.RecordOf<StateRecordProps>,
  modals: Immutable.RecordOf<ModalsRecordProps>
};
