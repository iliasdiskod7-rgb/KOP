import type { Ypodeigma3EntryScope, Ypodeigma3Moira, Ypodeigma3Row } from './types';

export const OUTSIDE_COLUMN_TYPES = ['sd', 'sa', 'p1'] as const;
export const MOIRA_COLUMN_TYPES = ['sd', 'sa', 'p1', 'op', 'opfs'] as const;

export type OutsideColumnType = (typeof OUTSIDE_COLUMN_TYPES)[number];
export type MoiraColumnType = (typeof MOIRA_COLUMN_TYPES)[number];

export function getOutsideAmountKey(columnType: OutsideColumnType) {
  return `outside::${columnType}`;
}

export function getMoiraAmountKey(moiraId: string, columnType: MoiraColumnType) {
  return `moira::${moiraId}::${columnType}`;
}

export function getRowCodeSegments(code: string) {
  return code.split('.').filter(Boolean);
}

export function getRowDepth(code: string) {
  return Math.max(getRowCodeSegments(code).length - 1, 0);
}

export function isDirectChildRow(parentCode: string, childCode: string) {
  const parentSegments = getRowCodeSegments(parentCode);
  const childSegments = getRowCodeSegments(childCode);

  if (childSegments.length !== parentSegments.length + 1) {
    return false;
  }

  return parentSegments.every((segment, index) => segment === childSegments[index]);
}

export function hasChildRows(row: Ypodeigma3Row, rows: Ypodeigma3Row[]) {
  return rows.some((candidateRow) => isDirectChildRow(row.code, candidateRow.code));
}

export function isLeafRow(row: Ypodeigma3Row, rows: Ypodeigma3Row[]) {
  return !hasChildRows(row, rows);
}

export function getDescendantLeafRows(row: Ypodeigma3Row, rows: Ypodeigma3Row[]) {
  const rowCodePrefix = `${row.code}.`;

  return rows.filter(
    (candidateRow) =>
      candidateRow.code.startsWith(rowCodePrefix) && isLeafRow(candidateRow, rows),
  );
}

export function parseAmount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function formatAmount(value: number | null) {
  if (value === null) {
    return '';
  }

  return new Intl.NumberFormat('el-GR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getEditableKeysForScope(
  entryScope: Ypodeigma3EntryScope,
  moires: Ypodeigma3Moira[],
) {
  if (entryScope === 'outside-moires') {
    return OUTSIDE_COLUMN_TYPES.map((columnType) => getOutsideAmountKey(columnType));
  }

  return moires.flatMap((moira) =>
    MOIRA_COLUMN_TYPES.map((columnType) => getMoiraAmountKey(moira.id, columnType)),
  );
}

export function getDisplayValue(
  row: Ypodeigma3Row,
  valueKey: string,
  rows: Ypodeigma3Row[],
) {
  if (isLeafRow(row, rows)) {
    return row.values[valueKey] ?? null;
  }

  const descendantLeafRows = getDescendantLeafRows(row, rows);

  if (descendantLeafRows.length === 0) {
    return null;
  }

  const total = descendantLeafRows.reduce((sum, leafRow) => {
    const nextValue = leafRow.values[valueKey];
    return sum + (nextValue ?? 0);
  }, 0);

  return total === 0 ? null : total;
}
