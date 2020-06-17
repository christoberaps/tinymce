import { Arr, Fun } from '@ephox/katamari';
import { Width, Element } from '@ephox/sugar';
import * as CellUtils from '../util/CellUtils';
import * as ColumnSizes from './ColumnSizes';
import * as Sizes from './Sizes';
import { Warehouse } from '../model/Warehouse';
import { BarPositions, ColInfo } from './BarPositions';

export type WidthType = 'fixed' | 'relative';

// Default = maintains existing behaviour - mainly makes it so that last column dragging preserves ratio for percentages (should it do the same for px as well as this didn't happen previously)
// ReseizeTable (dynamic) = All column width changes will change the width of the table
// Static - column resizing doesn't affect the overall table width
export type ColumnSizing = 'resizetable' | 'static' | 'default';

export interface TableSize {
  width: () => number;
  pixelWidth: () => number;
  getWidths: (warehouse: Warehouse, direction: BarPositions<ColInfo>, tableSize: TableSize) => number[];
  getNewWidths: (widths: number[], deltas: number[]) => number[];
  getCellDelta: (delta: number) => number;
  singleColumnWidth: (w: number, delta: number) => number[];
  minCellWidth: () => number;
  setElementWidth: (cell: Element, amount: number) => void;
  setTableWidth: (table: Element, index: number, oldWidths: number[], newWidths: number[], deltas: number[], delta: number) => void;
  widthType: WidthType;
  columnSizing: ColumnSizing;
}

const percentageSize = function (width: string, element: Element, columnResizeBehaviour: ColumnSizing): TableSize {
  const floatWidth = parseFloat(width);
  const pixelWidth = Width.get(element);
  const getCellDelta = function (delta: number) {
    return delta / pixelWidth * 100;
  };
  const singleColumnWidth = function (w: number, _delta: number) {
    // If we have one column in a percent based table, that column should be 100% of the width of the table.
    return [ 100 - w ];
  };
  // Get the width of a 10 pixel wide cell over the width of the table as a percentage
  const minCellWidth = function () {
    return CellUtils.minWidth() / pixelWidth * 100;
  };
  const setTableWidth = function (table: Element, index: number, oldWidths: number[], _newWidths: number[], deltas: number[], delta: number) {
    let newDelta = delta;
    // RTL (relative) over another column
    if (columnResizeBehaviour !== 'default' && delta < 0 && Math.abs(delta) > oldWidths[index]) {
      newDelta = Arr.foldl(deltas, (b, a) => b + a, 0);
    }
    const ratio = newDelta / 100;
    const change = ratio * floatWidth;
    Sizes.setPercentageWidth(table, floatWidth + change);
  };
  const getNewWidths = (widths: number[], deltas: number[]) => {
    const initialNewWidths = Arr.map(widths, (width, i) => width + deltas[i]);
    const normaliser = 100 / Arr.foldr(initialNewWidths, (b, a) => b + a, 0);
    // Normalise widths to add up to 100%
    return Arr.map(initialNewWidths, (w) => w * normaliser);
  };
  return {
    width: Fun.constant(floatWidth),
    pixelWidth: Fun.constant(pixelWidth),
    getWidths: ColumnSizes.getPercentageWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth,
    setElementWidth: Sizes.setPercentageWidth,
    setTableWidth,
    widthType: 'relative',
    columnSizing: columnResizeBehaviour,
    getNewWidths
  };
};

const pixelSize = function (width: number, columnResizeBehaviour: ColumnSizing): TableSize {
  const getCellDelta = Fun.identity;
  const singleColumnWidth = function (w: number, delta: number) {
    const newNext = Math.max(CellUtils.minWidth(), w + delta);
    return [ newNext - w ];
  };
  const setTableWidth = function (table: Element, _index: number, oldWidths: number[], newWidths: number[], _deltas: number[], _delta: number) {
    const newWidthsTotal = Arr.foldr(newWidths, (b, a) => b + a, 0);
    // Need extra px for padding and borderWidth
    const extra = width - Arr.foldl(oldWidths, (b, a) => b + a, 0);
    Sizes.setPixelWidth(table, newWidthsTotal + extra);
  };
  const getNewWidths = (widths: number[], deltas: number[]) => Arr.map(widths, (width, i) => width + deltas[i]);
  return {
    width: Fun.constant(width),
    pixelWidth: Fun.constant(width),
    getWidths: ColumnSizes.getPixelWidths,
    getCellDelta,
    singleColumnWidth,
    minCellWidth: CellUtils.minWidth,
    setElementWidth: Sizes.setPixelWidth,
    setTableWidth,
    widthType: 'fixed',
    columnSizing: columnResizeBehaviour,
    getNewWidths
  };
};

const chooseSize = function (element: Element, width: string, columnResizeBehaviour: ColumnSizing) {
  const percentMatch = Sizes.percentageBasedSizeRegex().exec(width);
  if (percentMatch !== null) {
    return percentageSize(percentMatch[1], element, columnResizeBehaviour);
  }
  const pixelMatch = Sizes.pixelBasedSizeRegex().exec(width);
  if (pixelMatch !== null) {
    const intWidth = parseInt(pixelMatch[1], 10);
    return pixelSize(intWidth, columnResizeBehaviour);
  }
  const fallbackWidth = Width.get(element);
  return pixelSize(fallbackWidth, columnResizeBehaviour);
};

const getTableSize = function (element: Element, columnResizeBehaviour: ColumnSizing = 'default') {
  const width = Sizes.getRawWidth(element);
  // If we have no width still, return a pixel width at least.
  return width.fold(function () {
    const fallbackWidth = Width.get(element);
    return pixelSize(fallbackWidth, columnResizeBehaviour);
  }, function (w) {
    return chooseSize(element, w, columnResizeBehaviour);
  });
};

export {
  getTableSize
};
