import type {
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
  Ypodeigma1TableCRow,
} from './types';

type HierarchicalRow = Ypodeigma1TableARow | Ypodeigma1TableBRow | Ypodeigma1TableCRow;

export function parseYpodeigma1Amount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function getRowCodeSegments(code: string) {
  return code
    .split('.')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export function getRowDepth(code: string) {
  const depth = getRowCodeSegments(code).length;
  return depth > 0 ? depth - 1 : 0;
}

export function isDirectChildRow(parentCode: string, childCode: string) {
  const parentSegments = getRowCodeSegments(parentCode);
  const childSegments = getRowCodeSegments(childCode);

  if (parentSegments.length === 0 || childSegments.length !== parentSegments.length + 1) {
    return false;
  }

  return parentSegments.every((segment, index) => childSegments[index] === segment);
}

export function getDirectChildRows<RowType extends HierarchicalRow>(row: RowType, rows: RowType[]) {
  return rows.filter((candidate) => candidate.id !== row.id && isDirectChildRow(row.code, candidate.code));
}

export function hasChildRows<RowType extends HierarchicalRow>(row: RowType, rows: RowType[]) {
  return getDirectChildRows(row, rows).length > 0;
}

export function isLeafRow<RowType extends HierarchicalRow>(row: RowType, rows: RowType[]) {
  return !hasChildRows(row, rows);
}

export function calculateRowAmount<RowType extends HierarchicalRow>(row: RowType, rows: RowType[]): number {
  const directChildren = getDirectChildRows(row, rows);

  if (directChildren.length === 0) {
    return row.amount ?? 0;
  }

  return directChildren.reduce((total, childRow) => total + calculateRowAmount(childRow, rows), 0);
}

export function calculateLeafGrandTotal<RowType extends HierarchicalRow>(rows: RowType[]) {
  return rows.reduce((total, row) => {
    if (!isLeafRow(row, rows)) {
      return total;
    }

    return total + (row.amount ?? 0);
  }, 0);
}
