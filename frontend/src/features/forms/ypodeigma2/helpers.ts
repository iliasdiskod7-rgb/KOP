import type {
  Ypodeigma2Identifier,
  Ypodeigma2Moira,
  Ypodeigma2Row,
} from './types';

export function getAmountKey(moiraId: Ypodeigma2Identifier, aleId: Ypodeigma2Identifier) {
  return `${String(moiraId)}::${String(aleId)}`;
}

export function getRowCodeSegments(code: string) {
  return code
    .split('.')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export function isDirectChildRow(parentCode: string, childCode: string) {
  const parentSegments = getRowCodeSegments(parentCode);
  const childSegments = getRowCodeSegments(childCode);

  if (parentSegments.length === 0 || childSegments.length !== parentSegments.length + 1) {
    return false;
  }

  return parentSegments.every((segment, index) => childSegments[index] === segment);
}

export function getDirectChildRows(row: Ypodeigma2Row, rows: Ypodeigma2Row[]) {
  return rows.filter((candidate) => candidate.id !== row.id && isDirectChildRow(row.code, candidate.code));
}

export function hasChildRows(row: Ypodeigma2Row, rows: Ypodeigma2Row[]) {
  return getDirectChildRows(row, rows).length > 0;
}

export function isLeafRow(row: Ypodeigma2Row, rows: Ypodeigma2Row[]) {
  return !hasChildRows(row, rows);
}

export function getLeafRows(rows: Ypodeigma2Row[]) {
  return rows.filter((row) => isLeafRow(row, rows));
}

export function getRowDepth(code: string) {
  const depth = getRowCodeSegments(code).length;
  return depth > 0 ? depth - 1 : 0;
}

export function calculateCellValue(
  row: Ypodeigma2Row,
  rows: Ypodeigma2Row[],
  moiraId: Ypodeigma2Identifier,
  aleId: Ypodeigma2Identifier,
): number {
  const directChildren = getDirectChildRows(row, rows);

  if (directChildren.length === 0) {
    return row.values[getAmountKey(moiraId, aleId)] ?? 0;
  }

  return directChildren.reduce(
    (total, childRow) => total + calculateCellValue(childRow, rows, moiraId, aleId),
    0,
  );
}

export function calculateHierarchicalRowTotal(
  row: Ypodeigma2Row,
  rows: Ypodeigma2Row[],
  moires: Ypodeigma2Moira[],
) {
  return moires.reduce((rowTotal, moira) => {
    const moiraTotal = moira.ales.reduce((aleTotal, ale) => {
      return aleTotal + calculateCellValue(row, rows, moira.id, ale.id);
    }, 0);

    return rowTotal + moiraTotal;
  }, 0);
}

export function calculateHierarchicalAleColumnTotal(
  moiraId: Ypodeigma2Identifier,
  aleId: Ypodeigma2Identifier,
  rows: Ypodeigma2Row[],
) {
  return getLeafRows(rows).reduce((total, row) => {
    return total + (row.values[getAmountKey(moiraId, aleId)] ?? 0);
  }, 0);
}

export function calculateHierarchicalMoiraTotal(moira: Ypodeigma2Moira, rows: Ypodeigma2Row[]) {
  return moira.ales.reduce((total, ale) => {
    return total + calculateHierarchicalAleColumnTotal(moira.id, ale.id, rows);
  }, 0);
}

export function calculateHierarchicalGrandTotal(rows: Ypodeigma2Row[], moires: Ypodeigma2Moira[]) {
  return getLeafRows(rows).reduce((total, row) => {
    return total + calculateHierarchicalRowTotal(row, rows, moires);
  }, 0);
}

export function formatTitleCase(value: string) {
  return value
    .toLocaleLowerCase('el-GR')
    .split(' ')
    .filter((part) => part.trim().length > 0)
    .map((part) =>
      part
        .split('-')
        .map((segment) => segment.charAt(0).toLocaleUpperCase('el-GR') + segment.slice(1))
        .join('-'),
    )
    .join(' ');
}
