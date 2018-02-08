// @flow

import type { Map, List } from "immutable";

export type ImmutableJSONType =
  | PrimitiveImmutable
  | Map<string, ImmutableJSONType>
  | List<ImmutableJSONType>;

export type ExecutionCount = number | null;

export type MimeBundle = JSONObject;

export type CellType = "markdown" | "code";
export type CellID = string;

// These are very unserious types, since Records are not quite typable
export type ImmutableNotebook = Map<string, any>;
export type ImmutableCodeCell = Map<string, any>;
export type ImmutableMarkdownCell = Map<string, any>;
export type ImmutableRawCell = Map<string, any>;
export type ImmutableCell = ImmutableCodeCell | ImmutableMarkdownCell;
export type ImmutableOutput = Map<string, any>;
export type ImmutableOutputs = List<ImmutableOutput>;

export type ImmutableMimeBundle = Map<string, any>;

export type ImmutableCellOrder = List<CellID>;
export type ImmutableCellMap = Map<CellID, ImmutableCell>;
