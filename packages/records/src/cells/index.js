// @flow

import * as codeCell from "./code-cell";

export * from "./code-cell";

export type NbformatCell = codeCell.NbformatCodeCell;

export type CellRecord = codeCell.CodeCellRecord;

/**
 * Turn any output that was in nbformat into a record
 */
export function cellFromNbformat(cell: NbformatCell): CellRecord {
  switch (cell.cell_type) {
    case codeCell.CODECELL:
      return codeCell.codeCellRecordFromNbformat(cell);
    default:
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}
