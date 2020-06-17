import { Arr } from '@ephox/katamari';
import * as Deltas from '../calc/Deltas';
import * as DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import * as ColumnSizes from './ColumnSizes';
import * as Recalculations from './Recalculations';
import * as Sizes from './Sizes';
import * as TableSize from './TableSize';
import * as CellUtils from '../util/CellUtils';
import { RowData, Detail } from '../api/Structs';
import { Element } from '@ephox/sugar';
import { BarPositions, ColInfo, RowInfo } from './BarPositions';
import { console } from '@ephox/dom-globals';

const getWarehouse = function <T extends Detail> (list: RowData<T>[]) {
  return Warehouse.generate(list);
};

const sumUp = function (newSize: number[]) {
  return Arr.foldr(newSize, function (b, a) {
    return b + a;
  }, 0);
};

const getTableWarehouse = function (table: Element) {
  const list = DetailsList.fromTable(table);
  return getWarehouse(list);
};

const adjustWidth = function (table: Element, delta: number, index: number, direction: BarPositions<ColInfo>, columnResizeBehaviour: TableSize.ColumnSizing) {
  const tableSize = TableSize.getTableSize(table, columnResizeBehaviour);
  const step = tableSize.getCellDelta(delta);
  const warehouse = getTableWarehouse(table);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);
  const isLastColumn = index === warehouse.grid.columns() - 1;

  console.log(columnResizeBehaviour);

  // Early return - do not need to mess with the cell widths if dragging the last column bar as the ratio should maintained between all of the columns
  // if (tableSize.columnSizing === 'default' && tableSize.widthType === TableSize.WidthType.Relative && isLastColumn) {
  //   tableSize.setTableWidth(table, [], step);
  //   return;
  // }

  // Calculate all of the new widths for columns
  const deltas = Deltas.determine(widths, index, step, tableSize);
  const newWidths = tableSize.getNewWidths(widths, deltas);

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, newWidths);
  Arr.each(newSizes, (cell) => {
    tableSize.setElementWidth(cell.element, cell.width);
  });

  // Set the overall width of the table.
  if (tableSize.columnSizing === 'resizetable' || isLastColumn) {
    // let newDelta = 0;

    // TODO: Potentially move below logic to 'setTableWidth' function

    // TODO: Maybe have function in table size to calcaulte the new Delta
    // if (tableSize.widthType === 'fixed') {
    //   // For px sizing, newDelta includes the extra px for the padding and border width that needs to be included for the new table width to be correct
    //   newDelta = tableSize.width() - sumUp(widths);
    // } else if (tableSize.columnSizing !== 'default' && step < 0 && Math.abs(step) > widths[index]) {
    //   // RTL (relative) over another column
    //   newDelta = sumUp(deltas);
    // } else {
    //   // Anything else
    //   newDelta = step;
    // }

    // relative sizing doesn't acutally use the newWidths variable internally
    tableSize.setTableWidth(table, index, widths, newWidths, deltas, step);
  }
};

const adjustHeight = function (table: Element, delta: number, index: number, direction: BarPositions<RowInfo>) {
  const warehouse = getTableWarehouse(table);
  const heights = ColumnSizes.getPixelHeights(warehouse, direction);

  const newHeights = Arr.map(heights, function (dy, i) {
    return index === i ? Math.max(delta + dy, CellUtils.minHeight()) : dy;
  });

  const newCellSizes = Recalculations.recalculateHeight(warehouse, newHeights);
  const newRowSizes = Recalculations.matchRowHeight(warehouse, newHeights);

  Arr.each(newRowSizes, function (row) {
    Sizes.setHeight(row.element(), row.height());
  });

  Arr.each(newCellSizes, function (cell) {
    Sizes.setHeight(cell.element(), cell.height());
  });

  const total = sumUp(newHeights);
  Sizes.setHeight(table, total);
};

// Ensure that the width of table cells match the passed in table information.
const adjustWidthTo = function <T extends Detail> (table: Element, list: RowData<T>[], direction: BarPositions<ColInfo>) {
  const tableSize = TableSize.getTableSize(table, 'default');
  const warehouse = getWarehouse(list);
  const widths = tableSize.getWidths(warehouse, direction, tableSize);

  // Set the width of each cell based on the column widths
  const newSizes = Recalculations.recalculateWidth(warehouse, widths);
  Arr.each(newSizes, function (cell) {
    tableSize.setElementWidth(cell.element, cell.width);
  });

  // const total = Arr.foldr(widths, function (b, a) { return a + b; }, 0);
  if (newSizes.length > 0) {
    // tableSize.setTableWidth(table, total);
    // WARNING, this may be incorrect, the commented out code above was the original
    tableSize.setTableWidth(table, 0, [], widths, [], tableSize.getCellDelta(0));
  }
};

export {
  adjustWidth,
  adjustHeight,
  adjustWidthTo
};
