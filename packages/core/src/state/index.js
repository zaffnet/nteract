// @flow
import * as Immutable from "immutable";
import type { CommunicationRecordProps } from "./communication";
import type {
  EntitiesRecordProps,
  LocalKernelProps,
  RemoteKernelProps
} from "./entities";
import type { KernelRef } from "./refs";
import type {
  LocalHostRecordProps,
  JupyterHostRecordProps
} from "./entities/hosts";
import type { Subject } from "rxjs/Subject";
import { emptyNotebook } from "@nteract/commutable";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord } from "./entities";

export * from "./communication";
export * from "./entities";
export * from "./ids";
export * from "./refs";

/*

This is the definition of JSON that Flow provides

type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

Which we'll adapt for our use of Immutable.js

*/
type ImmutableJSON =
  | string
  | number
  | boolean
  | null
  | ImmutableJSONMap
  | ImmutableJSONList; // eslint-disable-line no-use-before-define

type ImmutableJSONMap = Immutable.Map<string, ImmutableJSON>;

type ImmutableJSONList = Immutable.List<ImmutableJSON>;

type KernelspecMetadata = {
  name: string,
  display_name: string,
  language: string
};

// Note: this is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
export type KernelInfo = {
  name: string,
  spec: KernelspecMetadata
};

export type LanguageInfoMetadata = {
  name: string,
  codemirror_mode?: string | ImmutableJSONMap,
  file_extension?: string,
  mimetype?: string,
  pygments_lexer?: string
};

export type NotebookMetadata = {
  kernelspec: KernelspecMetadata,
  language_info: LanguageInfoMetadata
  // NOTE: We're not currently using orig_nbformat in nteract. Based on the comment
  // in the schema, we won't:
  //
  //   > Original notebook format (major number) before converting the notebook between versions. This should never be written to a file
  //
  //   from https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L58-L61
  //
  // It seems like an intermediate/in-memory representation that bled its way into the spec, when it should have been
  // handled as separate state.
  //
  // orig_nbformat?: number,
};

export type DocumentRecordProps = {
  // TODO: This _needs_ to become a Record
  notebook: Immutable.Map<string, any>,
  savedNotebook: Immutable.Map<string, any>,
  filename: ?string,
  transient: Immutable.Map<string, any>, // has the keypaths for updating displays
  // transient should be more fully typed (be a record itself)
  // right now it's keypaths and then it looks like it's able to handle any per
  // cell transient data that will be deleted when the kernel is restarted
  cellPagers: any,
  stickyCells: Immutable.Set<any>,
  editorFocused: any,
  cellFocused: any,
  copied: Immutable.Map<any, any>
};

export const makeDocumentRecord: Immutable.RecordFactory<
  DocumentRecordProps
> = Immutable.Record({
  notebook: emptyNotebook,
  savedNotebook: emptyNotebook,
  transient: Immutable.Map({
    keyPathsForDisplays: Immutable.Map()
  }),
  cellPagers: Immutable.Map(),
  stickyCells: Immutable.Set(),
  editorFocused: null,
  cellFocused: null,
  copied: Immutable.Map(),
  filename: ""
});

export type DocumentRecord = Immutable.RecordOf<DocumentRecordProps>;

export type CommsRecordProps = {
  targets: Immutable.Map<any, any>,
  info: Immutable.Map<any, any>,
  models: Immutable.Map<any, any>
};

export type CommsRecord = Immutable.RecordOf<CommsRecordProps>;

export const makeCommsRecord = Immutable.Record({
  targets: new Immutable.Map(),
  info: new Immutable.Map(),
  models: new Immutable.Map()
});

// Pull version from core's package.json
const version: string = require("../../package.json").version;

export type ConfigState = Immutable.Map<string, any>;

export type StateRecordProps = {
  kernelRef: ?KernelRef,
  communication: Immutable.RecordOf<CommunicationRecordProps>,
  entities: Immutable.RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: Immutable.RecordFactory<
  StateRecordProps
> = Immutable.Record({
  kernelRef: null,
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});

export type AppRecordProps = {
  kernel:
    | ?Immutable.RecordOf<RemoteKernelProps>
    | ?Immutable.RecordOf<LocalKernelProps>,
  host:
    | ?Immutable.RecordOf<LocalHostRecordProps>
    | ?Immutable.RecordOf<JupyterHostRecordProps>,
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
  core: Immutable.RecordOf<StateRecordProps>
};
