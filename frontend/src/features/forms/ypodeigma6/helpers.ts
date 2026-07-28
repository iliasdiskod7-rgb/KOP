import type { Ypodeigma6Row } from './types';

export function parseYpodeigma6Number(rawValue: string): number | null {
  const normalizedValue = rawValue.trim().replace(',', '.');

  if (normalizedValue === '') {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function sanitizeYpodeigma6Number(rawValue: string) {
  return rawValue.replace(/[^0-9.,]/g, '');
}

export function calculateYpodeigma6Total(row: Ypodeigma6Row) {
  if (row.quantity === null || row.costPerUnit === null) {
    return 0;
  }

  return row.quantity * row.costPerUnit;
}

export function formatYpodeigma6Number(value: number | null) {
  if (value === null) {
    return '';
  }

  return new Intl.NumberFormat('el-GR', {
    maximumFractionDigits: 2,
  }).format(value);
}
