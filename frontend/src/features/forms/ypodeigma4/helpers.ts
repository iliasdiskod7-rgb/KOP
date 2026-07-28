import type { Ypodeigma4Moira, Ypodeigma4Row } from './types';

export function getYpodeigma4AmountKey(moiraId: string) {
  return `moira::${moiraId}`;
}

export function calculateYpodeigma4RowTotal(
  row: Ypodeigma4Row,
  moires: Ypodeigma4Moira[],
) {
  const total = moires.reduce((sum, moira) => {
    const value = row.values[getYpodeigma4AmountKey(moira.id)];
    return sum + (value ?? 0);
  }, 0);

  return total === 0 ? null : total;
}

export function calculateYpodeigma4Percentage(
  moiraValue: number | null,
  totalValue: number | null,
) {
  if (moiraValue === null || totalValue === null || totalValue === 0) {
    return null;
  }

  return Math.round((moiraValue / totalValue) * 100 * 100) / 100;
}

export function parseYpodeigma4Amount(rawValue: string) {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function formatYpodeigma4Amount(value: number | null) {
  if (value === null) {
    return '';
  }

  return new Intl.NumberFormat('el-GR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
