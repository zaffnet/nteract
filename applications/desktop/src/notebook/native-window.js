// @flow
import { remote } from "electron";
import { is } from "immutable";

import path from "path";

import { selectors } from "@nteract/core";

import { of } from "rxjs/observable/of";
// $FlowFixMe: This exists, we're missing a flow definition
import { combineLatest } from "rxjs/observable/combineLatest";
import { from } from "rxjs/observable/from";

import {
  map,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  filter
} from "rxjs/operators";

const HOME = remote.app.getPath("home");

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
export function tildify(p: ?string) {
  if (!p) {
    return "";
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0
    ? s.replace(HOME + path.sep, `~${path.sep}`)
    : s
  ).slice(0, -1);
}

export function setTitleFromAttributes(attributes: *) {
  const filename = tildify(attributes.fullpath);
  const { kernelStatus } = attributes;

  try {
    const win = remote.getCurrentWindow();
    if (filename && win.setRepresentedFilename) {
      win.setRepresentedFilename(attributes.fullpath);
      win.setDocumentEdited(attributes.modified);
    }
    const title = `${filename} - ${kernelStatus}`;
    win.setTitle(title);
  } catch (e) {
    /* istanbul ignore next */
    (function log1277() {
      console.error(
        "Unable to set the filename, see https://github.com/nteract/nteract/issues/1277"
      );
      console.error(e);
      console.error(e.stack);
    })();
  }
}

export function createTitleFeed(state$: *) {
  const modified$ = state$.pipe(
    filter(state => selectors.currentContentRef(state)),
    map(state => {
      const contentRef = selectors.currentContentRef(state);
      if (!contentRef) {
        return false;
      }
      const model = selectors.model(state, { contentRef });
      if (!model || model.type !== "notebook") {
        return false;
      }

      return !selectors.notebook.hasBeenSaved(model);
    }),
    distinctUntilChanged()
  );

  const fullpath$ = state$.pipe(
    filter(state => selectors.currentContentRef(state)),
    map(state => selectors.currentFilepath(state) || "Untitled")
  );

  const kernelStatus$ = state$.pipe(
    filter(state => selectors.currentContentRef(state)),
    map(state => selectors.currentKernelStatus(state) || "not connected"),
    debounceTime(200)
  );

  return combineLatest(
    modified$,
    fullpath$,
    kernelStatus$,
    (modified, fullpath, kernelStatus) => ({
      modified,
      fullpath,
      kernelStatus
    })
  ).pipe(distinctUntilChanged(), switchMap(i => of(i)));
}

export function initNativeHandlers(store: *) {
  const state$ = from(store);

  return createTitleFeed(state$).subscribe(setTitleFromAttributes, err =>
    console.error(err)
  );
}
