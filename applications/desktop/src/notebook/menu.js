// @flow
/* eslint-disable no-unused-vars, no-use-before-define */
import { ipcRenderer as ipc, webFrame, remote, shell } from "electron";

import * as path from "path";

import * as fs from "fs";

import { throttle } from "lodash";

import { actions, selectors, state as stateModule } from "@nteract/core";

import type { KernelRef } from "@nteract/core/src/state/refs";

export function cwdKernelFallback() {
  // HACK: If we see they're at /, we assume that was the OS launching the Application
  //       from a launcher (launchctl on macOS)
  if (process.cwd() === "/") {
    return remote.app.getPath("home");
  }
  return process.cwd();
}

export function dispatchSaveAs(store: *, evt: Event, filepath: string) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);

  store.dispatch(actions.saveAs({ filepath, contentRef }));
}

const dialog = remote.dialog;

type SaveDialogOptions = {
  title: string,
  filters: Array<Object>,
  defaultPath?: string
};

export function showSaveAsDialog(): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: SaveDialogOptions = {
      title: "Save Notebook",
      filters: [{ name: "Notebooks", extensions: ["ipynb"] }]
    };

    // In Electron, we want an object we can merge into dialog opts, falling back
    // to the defaults from the dialog by not defining defaultPath. Electron treats
    // a literal undefined differently than this not being set.
    const defaultPath = cwdKernelFallback();
    if (process.cwd() !== defaultPath) {
      options.defaultPath = defaultPath;
    }

    dialog.showSaveDialog(options, filepath => {
      // If there was a filepath set and the extension name for it is blank,
      // append `.ipynb`
      if (filepath && path.extname(filepath) === "") {
        resolve(`${filepath}.ipynb`);
        return;
      }
      // Adhere to the electron API by resolving undefined
      // This happens when the user cancels the dialog
      if (filepath === undefined) {
        resolve(filepath);
        return;
      }
      // Assume it was a good path otherwise
      resolve(filepath);
    });
  });
}

export function triggerWindowRefresh(store: *, filepath: string) {
  if (!filepath) {
    return;
  }

  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.saveAs({ filepath, contentRef }));
}

export function dispatchRestartKernel(store: *) {
  const state = store.getState();
  const kernelRef = selectors.currentKernelRef(state);
  const contentRef = selectors.currentContentRef(state);

  store.dispatch(
    actions.restartKernel({ clearOutputs: false, kernelRef, contentRef })
  );
}

export function promptUserAboutNewKernel(
  store: *,
  filepath: string
): Promise<*> {
  return new Promise(resolve => {
    dialog.showMessageBox(
      {
        type: "question",
        buttons: ["Launch New Kernel", "Don't Launch New Kernel"],
        title: "New Kernel Needs to Be Launched",
        message:
          "It looks like you've saved your notebook file to a new location.",
        detail:
          "The kernel executing your code thinks your notebook is still in the " +
          "old location. Would you like to launch a new kernel to match it with the " +
          "new location of the notebook?"
      },
      index => {
        if (index === 0) {
          const state = store.getState();
          const kernel = selectors.currentKernel(state);
          const cwd = filepath
            ? path.dirname(path.resolve(filepath))
            : cwdKernelFallback();

          // Create a brand new kernel
          const kernelRef = stateModule.createKernelRef();
          const contentRef = selectors.currentContentRef(state);

          store.dispatch(
            actions.launchKernelByName({
              kernelSpecName: kernel.kernelSpecName,
              cwd,
              selectNextKernel: true,
              kernelRef,
              contentRef
            })
          );
        }
        resolve();
      }
    );
  });
}

export function triggerSaveAs(store: *) {
  showSaveAsDialog().then(filepath => {
    if (filepath) {
      triggerWindowRefresh(store, filepath);
      promptUserAboutNewKernel(store, filepath);
    }
  });
}

export function dispatchSave(store: *) {
  const state = store.getState();
  const filepath = selectors.currentFilepath(state);
  if (!filepath) {
    triggerSaveAs(store);
  } else {
    const contentRef = selectors.currentContentRef(state);
    store.dispatch(actions.save({ contentRef }));
  }
}

export function dispatchNewKernel(store: *, evt: Event, spec: Object) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  const filepath = selectors.currentFilepath(state);
  const cwd = filepath
    ? path.dirname(path.resolve(filepath))
    : cwdKernelFallback();

  // Create a brand new kernel
  const kernelRef = stateModule.createKernelRef();

  store.dispatch(
    actions.launchKernel({
      kernelSpec: spec,
      cwd,
      selectNextKernel: true,
      kernelRef,
      contentRef
    })
  );
}

export function dispatchPublishAnonGist(store: *) {
  store.dispatch({ type: "PUBLISH_ANONYMOUS_GIST" });
}

export function dispatchPublishUserGist(
  store: *,
  event: Event,
  githubToken: string
) {
  if (githubToken) {
    store.dispatch(actions.setGithubToken(githubToken));
  }
  store.dispatch({ type: "PUBLISH_USER_GIST" });
}

export function dispatchRunAllBelow(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.executeAllCellsBelow({ contentRef }));
}

export function dispatchRunAll(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.executeAllCells({ contentRef }));
}

export function dispatchClearAll(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.clearAllOutputs({ contentRef }));
}

export function dispatchUnhideAll(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(
    actions.unhideAll({
      outputHidden: false,
      inputHidden: false,
      contentRef
    })
  );
}

export function dispatchKillKernel(store: *) {
  const state = store.getState();
  const kernelRef = selectors.currentKernelRef(state);
  store.dispatch(actions.killKernel({ restarting: false, kernelRef }));
}

export function dispatchInterruptKernel(store: *) {
  const state = store.getState();

  const notificationSystem = selectors.notificationSystem(state);
  if (process.platform === "win32") {
    notificationSystem.addNotification({
      title: "Not supported in Windows",
      message: "Kernel interruption is currently not supported in Windows.",
      level: "error"
    });
  } else {
    const kernelRef = selectors.currentKernelRef(state);

    store.dispatch(actions.interruptKernel({ kernelRef }));
  }
}

export function dispatchRestartClearAll(store: *) {
  const state = store.getState();
  const kernelRef = selectors.currentKernelRef(state);
  const contentRef = selectors.currentContentRef(state);

  store.dispatch(
    actions.restartKernel({ clearOutputs: true, kernelRef, contentRef })
  );
}

export function dispatchZoomIn() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
}

export function dispatchZoomReset() {
  webFrame.setZoomLevel(0);
}

export function dispatchSetTheme(store: *, evt: Event, theme: string) {
  store.dispatch(actions.setTheme(theme));
}

export function dispatchSetCursorBlink(store: *, evt: Event, value: *) {
  store.dispatch(actions.setCursorBlink(value));
}

export function dispatchCopyCell(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.copyCell({ contentRef }));
}

export function dispatchCutCell(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.cutCell({ contentRef }));
}

export function dispatchPasteCell(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(actions.pasteCell({ contentRef }));
}

export function dispatchCreateCellAfter(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(
    actions.createCellAfter({
      cellType: "code",
      source: "",
      contentRef
    })
  );
}

export function dispatchCreateTextCellAfter(store: *) {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);
  store.dispatch(
    actions.createCellAfter({
      cellType: "markdown",
      source: "",
      contentRef
    })
  );
}

export function dispatchLoad(store: *, event: Event, filepath: string) {
  const state = store.getState();
  const kernelRef = stateModule.createKernelRef();
  const contentRef = selectors.currentContentRef(state);

  store.dispatch(
    actions.fetchContent({ filepath, params: {}, kernelRef, contentRef })
  );
}

export function dispatchNewNotebook(
  store: *,
  event: Event,
  kernelSpec: Object
) {
  const state = store.getState();
  const kernelRef = stateModule.createKernelRef();
  const contentRef = selectors.currentContentRef(state);

  store.dispatch(
    // for desktop, we _can_ assume this has no path except for living in `cwd`
    // which I suppose _could_ be called `${cwd}/UntitledN.ipynb`
    // for jupyter extension, we _would_ call this `${cwd}/UntitledN.ipynb`

    actions.newNotebook({
      kernelSpec,
      cwd: cwdKernelFallback(),
      kernelRef,
      contentRef
    })
  );
}

/**
 * Print the current notebook to PDF.
 * It will expand all cell outputs before printing and restore cells it expanded when complete.
 *
 * @param {object} store - The Redux store
 * @param {string} filepath - filepath of PDF to be saved.
 * @param {any} notificationSystem - reference to global notification system
 */
export function exportPDF(
  store: *,
  filepath: string,
  notificationSystem: *
): void {
  const state = store.getState();
  const contentRef = selectors.currentContentRef(state);

  const unexpandedCells = selectors.currentIdsOfHiddenOutputs(state);
  // TODO: we should not be modifying the document to print PDFs
  //       and we especially shouldn't be relying on all these actions to
  //       run through before we print...
  // Expand unexpanded cells
  unexpandedCells.map(cellID =>
    store.dispatch(actions.toggleOutputExpansion({ id: cellID, contentRef }))
  );

  remote.getCurrentWindow().webContents.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error) throw error;

      // Restore the modified cells to their unexpanded state.
      unexpandedCells.map(cellID =>
        store.dispatch(
          actions.toggleOutputExpansion({ id: cellID, contentRef })
        )
      );

      fs.writeFile(`${filepath}.pdf`, data, error_fs => {
        notificationSystem.addNotification({
          title: "PDF exported",
          message: `Notebook ${filepath} has been exported as a pdf.`,
          dismissible: true,
          position: "tr",
          level: "success",
          action: {
            label: "Open PDF",
            callback: function openPDF() {
              shell.openItem(`${filepath}.pdf`);
            }
          }
        });
      });
    }
  );
}

export function triggerSaveAsPDF(store: *) {
  showSaveAsDialog()
    .then(filepath => {
      if (filepath) {
        return Promise.all([triggerWindowRefresh(store, filepath)]).then(() =>
          storeToPDF(store)
        );
      }
    })
    .catch(e =>
      store.dispatch({ type: "ERROR", payload: e.message, error: true })
    );
}

export function storeToPDF(store: *) {
  const state = store.getState();
  const notebookName = selectors.currentFilepath(state);
  const basename = path.basename(notebookName, ".ipynb");
  const notificationSystem = state.app.get("notificationSystem");
  if (basename === "") {
    notificationSystem.addNotification({
      title: "File has not been saved!",
      message: [
        "Click the button below to save the notebook such that it can be ",
        "exported as a PDF."
      ],
      dismissible: true,
      position: "tr",
      level: "warning",
      action: {
        label: "Save As",
        callback: function cb() {
          triggerSaveAsPDF(store);
        }
      }
    });
  } else {
    const filepath = path.join(path.dirname(notebookName), basename);
    exportPDF(store, filepath, notificationSystem);
  }
}

export function dispatchLoadConfig(store: *) {
  store.dispatch(actions.loadConfig());
}

export function initMenuHandlers(store: *) {
  ipc.on("main:new", dispatchNewNotebook.bind(null, store));
  ipc.on("menu:new-kernel", dispatchNewKernel.bind(null, store));
  ipc.on("menu:run-all", dispatchRunAll.bind(null, store));
  ipc.on("menu:run-all-below", dispatchRunAllBelow.bind(null, store));
  ipc.on("menu:clear-all", dispatchClearAll.bind(null, store));
  ipc.on("menu:unhide-all", dispatchUnhideAll.bind(null, store));
  ipc.on("menu:save", throttle(dispatchSave.bind(null, store), 2000));
  ipc.on("menu:save-as", dispatchSaveAs.bind(null, store));
  ipc.on("menu:new-code-cell", dispatchCreateCellAfter.bind(null, store));
  ipc.on("menu:new-text-cell", dispatchCreateTextCellAfter.bind(null, store));
  ipc.on("menu:copy-cell", dispatchCopyCell.bind(null, store));
  ipc.on("menu:cut-cell", dispatchCutCell.bind(null, store));
  ipc.on("menu:paste-cell", dispatchPasteCell.bind(null, store));
  ipc.on("menu:kill-kernel", dispatchKillKernel.bind(null, store));
  ipc.on("menu:interrupt-kernel", dispatchInterruptKernel.bind(null, store));
  ipc.on("menu:restart-kernel", dispatchRestartKernel.bind(null, store));
  ipc.on(
    "menu:restart-and-clear-all",
    dispatchRestartClearAll.bind(null, store)
  );
  ipc.on("menu:publish:gist", dispatchPublishAnonGist.bind(null, store));
  ipc.on("menu:zoom-in", dispatchZoomIn);
  ipc.on("menu:zoom-out", dispatchZoomOut);
  ipc.on("menu:zoom-reset", dispatchZoomReset);
  ipc.on("menu:theme", dispatchSetTheme.bind(null, store));
  ipc.on("menu:set-blink-rate", dispatchSetCursorBlink.bind(null, store));
  ipc.on("menu:github:auth", dispatchPublishUserGist.bind(null, store));
  ipc.on("menu:exportPDF", storeToPDF.bind(null, store));
  // OCD: This is more like the registration of main -> renderer thread
  ipc.on("main:load", dispatchLoad.bind(null, store));
  ipc.on("main:load-config", dispatchLoadConfig.bind(null, store));
}
