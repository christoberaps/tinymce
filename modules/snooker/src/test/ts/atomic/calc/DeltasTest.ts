import { Arr, Fun } from '@ephox/katamari';
import * as Deltas from 'ephox/snooker/calc/Deltas';
import { UnitTest, assert } from '@ephox/bedrock-client';
import { TableSize } from 'ephox/snooker/resize/TableSize';
import { console } from '@ephox/dom-globals';

UnitTest.test('Deltas', () => {
  const min = 10;
  const check = (msg: string, expected: number[], input: number[], column: number, step: number, tableSizeConfig: Record<string, string> = {}) => {
    const singleColumnWidth = (width: number, _delta: number) => {
      const newNext = Math.max(min, width + step);
      return [ newNext - width ];
    };
    const tableSize = {
      minCellWidth: Fun.constant(10),
      singleColumnWidth,
      ...tableSizeConfig
    };
    const actual = Deltas.determine(input, column, step, tableSize as TableSize);
    console.log(actual);
    assert.eq(expected, Arr.map(actual, (num) => Math.round(num)), msg);
  };

  check('deltas - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20);
  check('deltas - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200);
  check('deltas - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20);
  check('deltas - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80);

  check('deltas - second column bar (0)', [ 0, -30, 30, 0 ], [ 100, 50, 250, 100 ], 1, -30);
  check('deltas - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -100);
  check('deltas - second column bar (2)', [ 0, 30, -30, 0 ], [ 100, 50, 250, 100 ], 1, 30);
  check('deltas - second column bar (3)', [ 0, 240, -240, 0 ], [ 100, 50, 250, 100 ], 1, 400);

  check('deltas - third column bar (0)', [ 0, 0, -20, 20 ], [ 100, 50, 250, 100 ], 2, -20);
  check('deltas - third column bar (1)', [ 0, 0, -240, 240 ], [ 100, 50, 250, 100 ], 2, -300);
  check('deltas - third column bar (2)', [ 0, 0, 20, -20 ], [ 100, 50, 250, 100 ], 2, 20);
  check('deltas - third column bar (3)', [ 0, 0, 90, -90 ], [ 100, 50, 250, 100 ], 2, 150);

  check('deltas - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50);
  check('deltas - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100);
  check('deltas - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50);
  check('deltas - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150);

  check('deltas - single column (0)', [ -70 ], [ 80 ], 0, -100);
  check('deltas - single column (1)', [ -100 ], [ 115 ], 0, -100);
  check('deltas - single column (2)', [ 25 ], [ 25 ], 0, 25);

  check('deltas - no columns', [], [], 0, 0);
  check('deltas - two columns', [ 50, -50 ], [ 200, 200 ], 0, 50);

  check('deltas - columnSizing: "static" - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, { columnSizing: 'static' });

  check('deltas - columnSizing: "static" - second column bar (0)', [ 0, -20, 20, 0 ], [ 100, 50, 250, 100 ], 1, -20, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -200, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - second column bar (2)', [ 0, 20, -20, 0 ], [ 100, 50, 250, 100 ], 1, 20, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - second column bar (3)', [ 0, 80, -80, 0 ], [ 100, 50, 250, 100 ], 1, 80, { columnSizing: 'static' });

  check('deltas - columnSizing: "static" - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50, { columnSizing: 'static' });
  check('deltas - columnSizing: "static" - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150, { columnSizing: 'static' });

  check('deltas - columnSizing: "resizetable" - first column bar (0)', [ -20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - first column bar (1)', [ -90, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - first column bar (2)', [ 20, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - first column bar (3)', [ 80, 0, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, { columnSizing: 'resizetable' });

  check('deltas - columnSizing: "resizetable" - second column bar (0)', [ 0, -20, 0, 0 ], [ 100, 50, 250, 100 ], 1, -20, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - second column bar (1)', [ 0, -40, 0, 0 ], [ 100, 50, 250, 100 ], 1, -200, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - second column bar (2)', [ 0, 20, 0, 0 ], [ 100, 50, 250, 100 ], 1, 20, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - second column bar (3)', [ 0, 80, 0, 0 ], [ 100, 50, 250, 100 ], 1, 80, { columnSizing: 'resizetable' });

  check('deltas - columnSizing: "resizetable" - last column bar (0)', [ 0, 0, 0, 50 ], [ 100, 50, 250, 100 ], 3, 50, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - last column bar (1)', [ 0, 0, 0, 100 ], [ 100, 50, 250, 100 ], 3, 100, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - last column bar (2)', [ 0, 0, 0, -50 ], [ 100, 50, 250, 100 ], 3, -50, { columnSizing: 'resizetable' });
  check('deltas - columnSizing: "resizetable" - last column bar (3)', [ 0, 0, 0, -90 ], [ 100, 50, 250, 100 ], 3, -150, { columnSizing: 'resizetable' });

  check('deltas - columnSizing: "default" - first column bar (0)', [ -20, 20, 0, 0 ], [ 100, 50, 250, 100 ], 0, -20, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - first column bar (1)', [ -90, 90, 0, 0 ], [ 100, 50, 250, 100 ], 0, -200, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - first column bar (2)', [ 20, -20, 0, 0 ], [ 100, 50, 250, 100 ], 0, 20, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - first column bar (3)', [ 40, -40, 0, 0 ], [ 100, 50, 250, 100 ], 0, 80, { columnSizing: 'default' });

  check('deltas - columnSizing: "default" - second column bar (0)', [ 0, -20, 20, 0 ], [ 100, 50, 250, 100 ], 1, -20, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - second column bar (1)', [ 0, -40, 40, 0 ], [ 100, 50, 250, 100 ], 1, -200, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - second column bar (2)', [ 0, 20, -20, 0 ], [ 100, 50, 250, 100 ], 1, 20, { columnSizing: 'default' });
  check('deltas - columnSizing: "default" - second column bar (3)', [ 0, 80, -80, 0 ], [ 100, 50, 250, 100 ], 1, 80, { columnSizing: 'default' });

  check('deltas - columnSizing: "default" - last column bar (relative) (0)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, 50, { columnSizing: 'default', widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (1)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, 100, { columnSizing: 'default', widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (2)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, -50, { columnSizing: 'default', widthType: 'relative' });
  check('deltas - columnSizing: "default" - last column bar (relative) (3)', [ 0, 0, 0, 0 ], [ 100, 50, 250, 100 ], 3, -150, { columnSizing: 'default', widthType: 'relative' });

  check('deltas - columnSizing: "default" - last column bar (fixed) (0)', [ 10, 5, 25, 10 ], [ 100, 50, 250, 100 ], 3, 50, { columnSizing: 'default', widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (1)', [ 20, 10, 50, 20 ], [ 100, 50, 250, 100 ], 3, 100, { columnSizing: 'default', widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (2)', [ -10, -5, -25, -10 ], [ 100, 50, 250, 100 ], 3, -50, { columnSizing: 'default', widthType: 'fixed' });
  check('deltas - columnSizing: "default" - last column bar (fixed) (3)', [ -30, -15, -75, -30 ], [ 100, 50, 250, 100 ], 3, -150, { columnSizing: 'default', widthType: 'fixed' });
});
