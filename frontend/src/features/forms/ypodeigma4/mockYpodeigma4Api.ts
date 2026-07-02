import { getYpodeigma4AmountKey } from './helpers';
import type { Ypodeigma4Config, Ypodeigma4Moira, Ypodeigma4Row } from './types';

const MOCK_MOIRES: Ypodeigma4Moira[] = [
  { id: '337m', label: '337Μ', displayOrder: 1 },
  { id: '338m', label: '338Μ', displayOrder: 2 },
  { id: '339m', label: '339Μ', displayOrder: 3 },
];

function createEmptyValues(moires: Ypodeigma4Moira[]) {
  return Object.fromEntries(
    moires.map((moira) => [getYpodeigma4AmountKey(moira.id), null]),
  ) satisfies Record<string, number | null>;
}

function createMockRows(moires: Ypodeigma4Moira[]): Ypodeigma4Row[] {
  return [
    {
      id: 'diatetheises-eo',
      label: 'Διατεθείσες ΕΩ',
      metricType: 'diatetheises-eo',
      displayOrder: 1,
      values: createEmptyValues(moires),
    },
    {
      id: 'pososto-diathesis-p2',
      label: 'Ποσοστό διάθεσης Π2 ανά Μοίρα Α/Φ',
      metricType: 'pososto-diathesis-p2',
      displayOrder: 2,
      values: createEmptyValues(moires),
    },
  ];
}

export function fetchYpodeigma4Config(): Promise<Ypodeigma4Config> {
  const sortedMoires = [...MOCK_MOIRES].sort((left, right) => left.displayOrder - right.displayOrder);

  return Promise.resolve({
    wing: {
      id: '110pm',
      name: '110ΠΜ',
    },
    unit: {
      id: '110msb',
      name: '110ΜΣΒ',
    },
    moires: sortedMoires,
    rows: createMockRows(sortedMoires),
  });
}
