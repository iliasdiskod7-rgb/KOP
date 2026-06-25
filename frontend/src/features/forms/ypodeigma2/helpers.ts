import type {
  Ypodeigma2Identifier,
  Ypodeigma2Moira,
  Ypodeigma2Row,
} from './types';

export function getAmountKey(moiraId: Ypodeigma2Identifier, aleId: Ypodeigma2Identifier) {
  // Κράτα το format αυτού του key ίδιο με το σύνθετο identifier που θα επιστρέφει το backend για τα ποσά.
  return `${String(moiraId)}::${String(aleId)}`;
}

export function calculateRowTotal(row: Ypodeigma2Row, moires: Ypodeigma2Moira[]) {
  return moires.reduce((rowTotal, moira) => {
    const moiraTotal = moira.ales.reduce((aleTotal, ale) => {
      const value = row.values[getAmountKey(moira.id, ale.id)];
      return aleTotal + (value ?? 0);
    }, 0);

    return rowTotal + moiraTotal;
  }, 0);
}

export function calculateAleColumnTotal(
  moiraId: Ypodeigma2Identifier,
  aleId: Ypodeigma2Identifier,
  rows: Ypodeigma2Row[],
) {
  return rows.reduce((total, row) => total + (row.values[getAmountKey(moiraId, aleId)] ?? 0), 0);
}

export function calculateGrandTotal(rows: Ypodeigma2Row[], moires: Ypodeigma2Moira[]) {
  return rows.reduce((total, row) => total + calculateRowTotal(row, moires), 0);
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
