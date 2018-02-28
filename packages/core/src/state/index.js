// @flow
import * as Immutable from "immutable";
import type { CommunicationRecordProps } from "./communication";
import type {
  EntitiesRecordProps,
  LocalKernelProps,
  RemoteKernelProps
} from "./entities";
import type { KernelRef } from "./refs";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord } from "./entities";

export * from "./communication";
export * from "./entities";
export * from "./ids";
export * from "./refs";
export * from "./old";

// Pull version from core's package.json
const version: string = require("../../package.json").version;

import type {
  DocumentRecordProps,
  CommsRecordProps,
  ModalsRecordProps
} from "./old";
import type {
  OldDesktopHostRecordProps,
  OldJupyterHostRecordProps
} from "./old/hosts";

export type ConfigState = Immutable.Map<string, any>;

export type StateRecordProps = {
  kernelRef: ?KernelRef,
  useCore: boolean,
  communication: Immutable.RecordOf<CommunicationRecordProps>,
  entities: Immutable.RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: Immutable.RecordFactory<
  StateRecordProps
> = Immutable.Record({
  kernelRef: null,
  useCore: false,
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});

export type AppRecordProps = {
  kernel:
    | ?Immutable.RecordOf<RemoteKernelProps>
    | ?Immutable.RecordOf<LocalKernelProps>,
  host:
    | ?Immutable.RecordOf<OldDesktopHostRecordProps>
    | ?Immutable.RecordOf<OldJupyterHostRecordProps>,
  githubToken: ?string,
  notificationSystem: { addNotification: Function },
  isSaving: boolean,
  lastSaved: ?Date,
  configLastSaved: ?Date,
  error: any,
  // The version number should be provided by an app on boot
  version: string
};

export const makeAppRecord: Immutable.RecordFactory<
  AppRecordProps
> = Immutable.Record({
  kernel: null,
  host: null,
  githubToken: null,
  notificationSystem: {
    addNotification: (msg: { level?: "error" | "warning" }) => {
      let logger = console.log.bind(console);
      switch (msg.level) {
        case "error":
          logger = console.error.bind(console);
          break;
        case "warning":
          logger = console.warn.bind(console);
          break;
      }
      logger(msg);
    }
  },
  isSaving: false,
  lastSaved: null,
  configLastSaved: null,
  error: null,
  // set the default version to @nteract/core's version
  version: `@nteract/core@${version}`
});

export type AppRecord = Immutable.RecordOf<AppRecordProps>;

export type AppState = {
  app: Immutable.RecordOf<AppRecordProps>,
  document: Immutable.RecordOf<DocumentRecordProps>,
  comms: Immutable.RecordOf<CommsRecordProps>,
  config: ConfigState,
  core: Immutable.RecordOf<StateRecordProps>,
  modals: Immutable.RecordOf<ModalsRecordProps>
};
