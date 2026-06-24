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
