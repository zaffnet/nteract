// Note, we can reuse keys, but all paths need to be unique in the menu.

// These actions map to a case in a switch handler. They are meant to cause a
// unique action from the menu.
export const MENU_ITEM_ACTIONS = {
  DOWNLOAD_NOTEBOOK: "download-notebook",
  EXECUTE_ALL_CELLS: "execute-all-cells",
  EXECUTE_ALL_CELLS_BELOW: "execute-all-cells-below",
  CLEAR_ALL_OUTPUTS: "clear-all-outputs",
  CREATE_CODE_CELL: "create-code-cell",
  CREATE_MARKDOWN_CELL: "create-markdown-cell",
  SET_CELL_TYPE_CODE: "set-cell-type-code",
  SET_CELL_TYPE_MARKDOWN: "set-cell-type-markdown",
  COPY_CELL: "copy-cell",
  CUT_CELL: "cut-cell",
  PASTE_CELL: "paste-cell",
  MERGE_CELL_AFTER: "merge-cell-after",
  SET_THEME_DARK: "set-theme-dark",
  SET_THEME_LIGHT: "set-theme-light"
};

// These are top-level-menu or sub-menu keys in case we need interim look-ups
// when users hover over sub-menu titles.
export const MENUS = {
  FILE: "file",
  EDIT: "edit",
  EDIT_SET_CELL_TYPE: "cell-set-cell-type",
  INSERT: "insert",
  CELL: "cell",
  CELL_CREATE_CELL: "cell-create-cell",
  VIEW: "view",
  VIEW_THEMES: "view-themes"
};
