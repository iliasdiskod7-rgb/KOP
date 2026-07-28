import { getYpodeigma4AmountKey } from './helpers';
import type { Ypodeigma4Config, Ypodeigma4Moira, Ypodeigma4Row } from './types';

type FetchYpodeigma4ConfigParams = {
  monadaId: string;
  monadaLabel: string;
  etos: number;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

const MOCK_MOIRES_BY_MONADA: Record<string, Ypodeigma4Moira[]> = {
  '110pm': [
    { id: '337m-110', label: '337Μ', displayOrder: 1 },
    { id: '338m-110', label: '338Μ', displayOrder: 2 },
  ],
  '116pm': [
    { id: '335m-116', label: '335Μ', displayOrder: 1 },
    { id: '336m-116', label: '336Μ', displayOrder: 2 },
  ],
  '117pm': [{ id: '339m-117', label: '339Μ', displayOrder: 1 }],
};

function createEmptyValues(moires: Ypodeigma4Moira[]): Record<string, number | null> {
  return Object.fromEntries(
    moires.map((moira) => [getYpodeigma4AmountKey(moira.id), null]),
  );
}

function createMockRows(
  moires: Ypodeigma4Moira[],
  includeExistingValues: boolean,
): Ypodeigma4Row[] {
  const diatetheisesValues = createEmptyValues(moires);
  const posostoValues = createEmptyValues(moires);

  if (includeExistingValues) {
    moires.forEach((moira, index) => {
      diatetheisesValues[getYpodeigma4AmountKey(moira.id)] = 1_200 + index * 180;
    });
  }

  return [
    {
      id: 'diatetheises-eo',
      label: 'Διατεθείσες ΕΩ',
      metricType: 'diatetheises-eo',
      displayOrder: 1,
      values: diatetheisesValues,
    },
    {
      id: 'pososto-diathesis-p2',
      label: 'Ποσοστό διάθεσης Π2 ανά Μοίρα Α/Φ',
      metricType: 'pososto-diathesis-p2',
      displayOrder: 2,
      values: posostoValues,
    },
  ];
}

export function fetchYpodeigma4Config({
  monadaId,
  monadaLabel,
  etosStatus,
  etosSource,
}: FetchYpodeigma4ConfigParams): Promise<Ypodeigma4Config> {
  const sortedMoires = [...(MOCK_MOIRES_BY_MONADA[monadaId] ?? [])].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );

  return Promise.resolve({
    wing: {
      id: monadaId,
      name: monadaLabel,
    },
    unit: {
      id: `${monadaId}-msb`,
      name: `${monadaLabel.replace('ΠΜ', '')}ΜΣΒ`,
    },
    status: etosStatus ?? 'view',
    moires: sortedMoires,
    rows: createMockRows(sortedMoires, etosSource !== 'new'),
  });
}
