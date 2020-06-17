/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Css, Element, SelectorFilter, Traverse } from '@ephox/sugar';
import { getPixelWidth } from '../alien/Util';

const calculatePercentageWidth = (element: Element, offsetParent: Element): string => getPixelWidth(element.dom()) / getPixelWidth(offsetParent.dom()) * 100 + '%';

const enforcePercentage = (rawTable: HTMLTableElement) => {
  const table = Element.fromDom(rawTable);

  Traverse.offsetParent(table).map((parent) => calculatePercentageWidth(table, parent)).each((tablePercentage) => {
    Css.set(table, 'width', tablePercentage);

    Arr.each(SelectorFilter.descendants(table, 'tr'), (tr) => {
      Arr.each(Traverse.children(tr), (td) => {
        Css.set(td, 'width', calculatePercentageWidth(td, tr));
      });
    });
  });
};

const enforcePixels = (table: HTMLTableElement) => {
  Css.set(Element.fromDom(table), 'width', getPixelWidth(table).toString() + 'px');
};

export {
  enforcePercentage,
  enforcePixels,
  calculatePercentageWidth
};
