// @flow
import * as Immutable from "immutable";
import * as React from "react";
import * as actions from "../../actions";
import * as extraHandlers from "./extra-handlers";
import * as selectors from "../../selectors";
import Menu, { SubMenu, Divider, MenuItem } from "rc-menu";
import type { KernelRef } from "../../state/refs";
import { MENU_ITEM_ACTIONS, MENUS } from "./constants";
import { MODAL_TYPES } from "../modal-controller";
import { connect } from "react-redux";
import { localCss } from "./styles";

// To allow actions that can take dynamic arguments (like selecting a kernel
// based on the host's kernelspecs), we have some simple utility functions to
// stringify/parse actions/arguments.
const createActionKey = (action, ...args) => [action, ...args].join(":");
const parseActionKey = key => key.split(":");

type Props = {
  defaultOpenKeys?: Array<string>,
  openKeys?: Array<string>,
  cellFocused: ?string,
  currentKernelRef: ?KernelRef,
  saveNotebook: ?() => void,
  executeCell: ?(cellId: ?string) => void,
  executeAllCells: ?() => void,
  executeAllCellsBelow: ?() => void,
  clearAllOutputs: ?(payload: *) => void,
  unhideAll: ?(*) => void,
  cutCell: ?(payload: *) => void,
  copyCell: ?(payload: *) => void,
  mergeCellAfter: ?(payload: *) => void,
  filename: ?string,
  notebook: Immutable.Map<string, *>,
  pasteCell: ?(payload: *) => void,
  createCodeCell: ?(cellId: ?string) => void,
  createMarkdownCell: ?(cellId: ?string) => void,
  setCellTypeCode: ?(cellId: ?string) => void,
  setCellTypeMarkdown: ?(cellId: ?string) => void,
  setTheme: ?(theme: ?string) => void,
  openAboutModal: ?() => void,
  restartKernel: ?(payload: *) => void,
  restartKernelAndClearOutputs: ?(payload: *) => void,
  killKernel: ?(payload: *) => void,
  interruptKernel: ?(payload: *) => void
};

class PureNotebookMenu extends React.Component<Props> {
  static defaultProps = {
    cellFocused: null,
    saveNotebook: null,
    currentKernelRef: null,
    executeCell: null,
    executeAllCells: null,
    executeAllCellsBelow: null,
    clearAllOutputs: null,
    unhideAll: null,
    cutCell: null,
    copyCell: null,
    mergeCellAfter: null,
    notebook: null,
    pasteCell: null,
    createCodeCell: null,
    createMarkdownCell: null,
    setCellTypeCode: null,
    setCellTypeMarkdown: null,
    setTheme: null,
    openAboutModal: null,
    restartKernel: null,
    killKernel: null,
    interruptKernel: null
  };
  handleClick = ({ key }: { key: string }) => {
    const {
      saveNotebook,
      cellFocused,
      currentKernelRef,
      copyCell,
      createCodeCell,
      createMarkdownCell,
      cutCell,
      executeCell,
      executeAllCells,
      executeAllCellsBelow,
      clearAllOutputs,
      unhideAll,
      filename,
      mergeCellAfter,
      notebook,
      openAboutModal,
      pasteCell,
      setCellTypeCode,
      setCellTypeMarkdown,
      setTheme,
      restartKernel,
      restartKernelAndClearOutputs,
      killKernel,
      interruptKernel
    } = this.props;
    const [action, ...args] = parseActionKey(key);
    switch (action) {
      case MENU_ITEM_ACTIONS.SAVE_NOTEBOOK:
        if (saveNotebook) {
          saveNotebook();
        }
        break;
      case MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK:
        // This gets us around a Flow fail on document.body.
        const body = document.body;
        if (body) {
          extraHandlers.downloadNotebook(notebook, filename);
        }
        break;
      case MENU_ITEM_ACTIONS.COPY_CELL:
        if (copyCell) {
          // TODO: #2618
          copyCell({ id: cellFocused });
        }
        break;
      case MENU_ITEM_ACTIONS.CUT_CELL:
        if (cutCell) {
          // TODO: #2618
          cutCell({ id: cellFocused });
        }
        break;
      case MENU_ITEM_ACTIONS.PASTE_CELL:
        if (pasteCell) {
          // TODO: #2618
          pasteCell({});
        }
        break;
      case MENU_ITEM_ACTIONS.MERGE_CELL_AFTER:
        if (mergeCellAfter) {
          // TODO: #2618
          mergeCellAfter({ id: cellFocused });
        }
        break;
      case MENU_ITEM_ACTIONS.CREATE_CODE_CELL:
        if (createCodeCell) {
          createCodeCell(cellFocused);
        }
        break;
      case MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL:
        if (createMarkdownCell) {
          createMarkdownCell(cellFocused);
        }
        break;
      case MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE:
        if (setCellTypeCode) {
          setCellTypeCode(cellFocused);
        }
        break;
      case MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN:
        if (setCellTypeMarkdown) {
          setCellTypeMarkdown(cellFocused);
        }
        break;
      case MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS:
        if (executeAllCells) {
          executeAllCells();
        }
        break;
      case MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW:
        if (executeAllCellsBelow) {
          executeAllCellsBelow();
        }
        break;
      case MENU_ITEM_ACTIONS.UNHIDE_ALL:
        if (unhideAll) {
          // TODO: #2618
          unhideAll({ outputHidden: false, inputHidden: false });
        }
        break;
      case MENU_ITEM_ACTIONS.CLEAR_ALL_OUTPUTS:
        if (clearAllOutputs) {
          // TODO: #2618
          clearAllOutputs({});
        }
        break;
      case MENU_ITEM_ACTIONS.SET_THEME_DARK:
        if (setTheme) {
          setTheme("dark");
        }
        break;
      case MENU_ITEM_ACTIONS.SET_THEME_LIGHT:
        if (setTheme) {
          setTheme("light");
        }
        break;
      case MENU_ITEM_ACTIONS.OPEN_ABOUT:
        if (openAboutModal) {
          openAboutModal();
        }
        break;
      case MENU_ITEM_ACTIONS.INTERRUPT_KERNEL:
        if (interruptKernel) {
          interruptKernel({ kernelRef: currentKernelRef });
        }
        break;
      case MENU_ITEM_ACTIONS.RESTART_KERNEL:
        if (restartKernel) {
          restartKernel({ kernelRef: currentKernelRef });
        }
        break;
      case MENU_ITEM_ACTIONS.KILL_KERNEL:
        if (killKernel) {
          killKernel({ kernelRef: currentKernelRef });
        }
        break;
      case MENU_ITEM_ACTIONS.RESTART_AND_CLEAR_OUTPUTS:
        if (restartKernelAndClearOutputs) {
          restartKernelAndClearOutputs({ kernelRef: currentKernelRef });
        }
        break;

      default:
        console.log(`unhandled action: ${action}`);
    }
  };
  render() {
    const { defaultOpenKeys } = this.props;
    return (
      <div>
        <Menu
          mode="horizontal"
          onClick={this.handleClick}
          defaultOpenKeys={defaultOpenKeys}
          selectable={false}
        >
          <SubMenu key={MENUS.FILE} title="File">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.SAVE_NOTEBOOK)}>
              Save
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK)}
            >
              Download (.ipynb)
            </MenuItem>
          </SubMenu>
          <SubMenu key={MENUS.EDIT} title="Edit">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.CUT_CELL)}>
              Cut Cell
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.COPY_CELL)}>
              Copy Cell
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.PASTE_CELL)}>
              Paste Cell Below
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.MERGE_CELL_AFTER)}>
              Merge With Cell Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.EDIT_SET_CELL_TYPE} title="Cell Type">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE)}
              >
                Code
              </MenuItem>
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN)}
              >
                Markdown
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu key={MENUS.VIEW} title="View">
            <SubMenu key={MENUS.VIEW_THEMES} title="themes">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_THEME_LIGHT)}
              >
                light
              </MenuItem>
              <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.SET_THEME_DARK)}>
                dark
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu key={MENUS.CELL} title="Cell">
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS)}
            >
              Run All Cells
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW)}
            >
              Run All Cells Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.CELL_CREATE_CELL} title="New Cell">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.CREATE_CODE_CELL)}
              >
                Code
              </MenuItem>
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL)}
              >
                Markdown
              </MenuItem>
            </SubMenu>
            <Divider />

            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.CLEAR_ALL_OUTPUTS)}
            >
              Clear All Outputs
            </MenuItem>

            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.UNHIDE_ALL)}>
              Unhide All Input and Output
            </MenuItem>
          </SubMenu>

          <SubMenu key={MENUS.RUNTIME} title="Runtime">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.INTERRUPT_KERNEL)}>
              Interrupt
            </MenuItem>
            <Divider />
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.KILL_KERNEL)}>
              Halt
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.RESTART_KERNEL)}>
              Restart
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.RESTART_AND_CLEAR_OUTPUTS)}
            >
              Restart and Clear All Cells
            </MenuItem>
            {/*
              <Divider />
              <SwitchToKernelSpecsMenu />
            */}
          </SubMenu>

          <SubMenu key={MENUS.HELP} title="Help">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.OPEN_ABOUT)}>
              About
            </MenuItem>
          </SubMenu>
        </Menu>
        <style global jsx>
          {localCss}
        </style>
        <style jsx>{`
          position: sticky;
          top: 0;
          // TODO: this is getting ridiculous...
          z-index: 10000;
        `}</style>
      </div>
    );
  }
}

// TODO: this forces the menu to re-render on cell focus. The better option is
// to alter how the actions work to just target the currently focused cell.
// That said, we *may* not have a great way of getting around this as we'll need
// information about the current document to decide which menu items are
// available...
const mapStateToProps = state => ({
  cellFocused: selectors.currentFocusedCellId(state),
  filename: selectors.currentFilename(state),
  notebook: selectors.currentNotebook(state),
  currentKernelRef: selectors.currentKernelRef(state)
});

const mapDispatchToProps = dispatch => ({
  saveNotebook: () => dispatch(actions.save()),
  executeCell: cellId => dispatch(actions.executeCell(cellId)),
  executeAllCells: () => dispatch(actions.executeAllCells()),
  executeAllCellsBelow: () => dispatch(actions.executeAllCellsBelow()),
  clearAllOutputs: (payload: *) => dispatch(actions.clearAllOutputs(payload)),
  unhideAll: payload => dispatch(actions.unhideAll(payload)),
  cutCell: (payload: *) => dispatch(actions.cutCell(payload)),
  copyCell: (payload: *) => dispatch(actions.copyCell(payload)),
  pasteCell: (payload: *) => dispatch(actions.pasteCell(payload)),
  mergeCellAfter: (payload: *) => dispatch(actions.mergeCellAfter(payload)),
  // TODO: #2618
  createCodeCell: cellId =>
    dispatch(
      actions.createCellAfter({ cellType: "code", id: cellId, source: "" })
    ),
  createMarkdownCell: cellId =>
    dispatch(
      actions.createCellAfter({ cellType: "markdown", id: cellId, source: "" })
    ),
  // TODO: #2618
  setCellTypeCode: cellId =>
    dispatch(actions.changeCellType({ id: cellId, to: "code" })),
  setCellTypeMarkdown: cellId =>
    dispatch(actions.changeCellType({ id: cellId, to: "markdown" })),
  setTheme: theme => dispatch(actions.setTheme(theme)),
  openAboutModal: () =>
    dispatch(actions.openModal({ modalType: MODAL_TYPES.ABOUT })),
  restartKernel: payload => dispatch(actions.restartKernel(payload)),
  restartKernelAndClearOutputs: payload =>
    dispatch(actions.restartKernel({ ...payload, clearOutputs: true })),
  killKernel: payload => dispatch(actions.killKernel(payload)),
  interruptKernel: payload => dispatch(actions.interruptKernel(payload))
});

const NotebookMenu = connect(mapStateToProps, mapDispatchToProps)(
  PureNotebookMenu
);

// We export this for testing purposes.
export { PureNotebookMenu };

export default NotebookMenu;
