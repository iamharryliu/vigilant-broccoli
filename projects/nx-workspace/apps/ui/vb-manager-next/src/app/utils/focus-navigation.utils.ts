export type Direction = 'up' | 'down' | 'left' | 'right';

type FocusNode = { element: HTMLElement; centerX: number; centerY: number };

type MoveFocusByDirectionOptions = {
  contentRoot: HTMLElement | null;
  searchInput: HTMLElement | null;
  currentElement: HTMLElement;
  direction: Direction;
  rowTolerance?: number;
  itemSelector?: string;
};

const DEFAULT_ITEM_SELECTOR = '[data-quick-link-item="true"]';
const DEFAULT_ROW_TOLERANCE = 14;

const getFocusableLinks = (
  contentRoot: HTMLElement,
  itemSelector: string,
): HTMLElement[] =>
  Array.from(contentRoot.querySelectorAll<HTMLElement>(itemSelector));

const buildLinkRows = (
  contentRoot: HTMLElement,
  rowTolerance: number,
  itemSelector: string,
): FocusNode[][] => {
  const nodes = getFocusableLinks(contentRoot, itemSelector)
    .filter(
      node =>
        !node.hasAttribute('disabled') &&
        node.tabIndex !== -1 &&
        node.getClientRects().length > 0,
    )
    .map<FocusNode>(element => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    })
    .sort((a, b) => a.centerY - b.centerY || a.centerX - b.centerX);

  const rows: FocusNode[][] = [];
  for (const node of nodes) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow) {
      rows.push([node]);
      continue;
    }

    const rowCenterY =
      lastRow.reduce((sum, item) => sum + item.centerY, 0) / lastRow.length;
    if (Math.abs(node.centerY - rowCenterY) <= rowTolerance) {
      lastRow.push(node);
    } else {
      rows.push([node]);
    }
  }

  for (const row of rows) {
    row.sort((a, b) => a.centerX - b.centerX);
  }

  return rows;
};

const findClosestByX = (row: FocusNode[], x: number): FocusNode | null => {
  if (row.length === 0) return null;
  let best = row[0];
  let bestDistance = Math.abs(best.centerX - x);
  for (const node of row) {
    const distance = Math.abs(node.centerX - x);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return best;
};

const findNodePosition = (rows: FocusNode[][], element: HTMLElement) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const itemIndex = rows[rowIndex].findIndex(
      node => node.element === element,
    );
    if (itemIndex !== -1) {
      return { rowIndex, itemIndex };
    }
  }
  return null;
};

const getTargetFromInput = (
  rows: FocusNode[][],
  currentElement: HTMLElement,
  direction: Direction,
) => {
  const inputRect = currentElement.getBoundingClientRect();
  const inputCenterX = inputRect.left + inputRect.width / 2;
  const targetRow =
    direction === 'down' || direction === 'right'
      ? rows[0]
      : rows[rows.length - 1];
  return findClosestByX(targetRow, inputCenterX)?.element ?? null;
};

const getHorizontalTarget = (
  rows: FocusNode[][],
  rowIndex: number,
  itemIndex: number,
  direction: 'left' | 'right',
) => {
  const row = rows[rowIndex];
  const prevRow = rows[rowIndex - 1];
  const nextRow = rows[rowIndex + 1];

  if (direction === 'right') {
    return row[itemIndex + 1]?.element ?? nextRow?.[0]?.element ?? null;
  }

  return (
    row[itemIndex - 1]?.element ??
    prevRow?.[prevRow.length - 1]?.element ??
    null
  );
};

const getVerticalTarget = (
  rows: FocusNode[][],
  rowIndex: number,
  centerX: number,
  direction: 'up' | 'down',
) => {
  const adjacentRow =
    direction === 'down' ? rows[rowIndex + 1] : rows[rowIndex - 1];
  if (!adjacentRow) return null;
  return findClosestByX(adjacentRow, centerX)?.element ?? null;
};

const getTargetWithinRows = (
  rows: FocusNode[][],
  rowIndex: number,
  itemIndex: number,
  direction: Direction,
) => {
  const current = rows[rowIndex][itemIndex];

  switch (direction) {
    case 'right':
    case 'left':
      return getHorizontalTarget(rows, rowIndex, itemIndex, direction);
    case 'down':
    case 'up':
      return getVerticalTarget(rows, rowIndex, current.centerX, direction);
  }
};

export const moveQuickLinkFocusByDirection = ({
  contentRoot,
  searchInput,
  currentElement,
  direction,
  rowTolerance = DEFAULT_ROW_TOLERANCE,
  itemSelector = DEFAULT_ITEM_SELECTOR,
}: MoveFocusByDirectionOptions) => {
  if (!contentRoot) return;

  const rows = buildLinkRows(contentRoot, rowTolerance, itemSelector);
  if (rows.length === 0) return;

  if (currentElement === searchInput) {
    getTargetFromInput(rows, currentElement, direction)?.focus();
    return;
  }

  const position = findNodePosition(rows, currentElement);
  if (!position) return;

  const target = getTargetWithinRows(
    rows,
    position.rowIndex,
    position.itemIndex,
    direction,
  );

  if (target) {
    target.focus();
    return;
  }

  searchInput?.focus();
};
