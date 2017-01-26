/* @flow */
import * as v4 from './v4';

import type { Notebook as v4Notebook } from './v4';

import {
  emptyNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  appendCell,
  monocellNotebook,
} from './structures';

import type {
  ImmutableNotebook,
  JSONType,
} from './types';

type PlaceholderNotebook = {
  nbformat: number,
  nbformat_minor: number,
};

export type Notebook = PlaceholderNotebook & v4Notebook;

function freezeReviver(k: string, v: JSONType): JSONType {
  return Object.freeze(v);
}

// Expected usage of below is
// fromJS(parseNotebook(string|buffer))

export function parseNotebook(notebookString: string): Notebook {
  return JSON.parse(notebookString, freezeReviver);
}

export function fromJS(notebookJSON: Notebook): ImmutableNotebook {
  if (notebookJSON.nbformat === 4 && notebookJSON.nbformat_minor >= 0) {
    if (Array.isArray(notebookJSON.cells) && typeof notebookJSON.metadata === 'object') {
      return v4.fromJS(notebookJSON);
    }
  }

  if (notebookJSON.nbformat) {
    throw new TypeError(
      `nbformat v${notebookJSON.nbformat}.${notebookJSON.nbformat_minor} not recognized`
    );
  }

  throw new TypeError('This notebook format is not supported');
}

export type {
  ImmutableNotebook,
};

export {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  appendCell,
  monocellNotebook,
};
