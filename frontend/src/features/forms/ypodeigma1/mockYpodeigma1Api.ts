import type {
  FetchYpodeigma1ForMoiraParams,
  Ypodeigma1MoiraData,
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
} from './types';

const MONADA_LABELS: Record<string, string> = {
  '110pm': '110ΠΜ',
  '116pm': '116ΠΜ',
  '117pm': '117ΠΜ',
};

const MOIRA_LABELS: Record<string, string> = {
  '337m-110': '337Μ',
  '338m-110': '338Μ',
  '335m-116': '335Μ',
  '336m-116': '336Μ',
  '339m-117': '339Μ',
};

const TABLE_1A_TEMPLATE: Ypodeigma1TableARow[] = [
  { id: '1a-1', code: '1.1', title: 'Καύσιμα Αποστολών', amount: null },
  { id: '1a-2', code: '1.2', title: 'Υποστήριξη Πληρωμάτων', amount: null },
  { id: '1a-3', code: '1.3', title: 'Λοιπές Δαπάνες Μοίρας', amount: null },
];

const TABLE_1B_TEMPLATE: Ypodeigma1TableBRow[] = [
  { id: '1b-1', code: '1Β.1', title: 'Συγκεντρωτικά Έξοδα Μετακίνησης', amount: null },
  { id: '1b-2', code: '1Β.2', title: 'Συνοδευτικές Δαπάνες', amount: null },
];

const EXISTING_YEAR_VALUES: Record<
  number,
  Record<string, { table1A: Array<number | null>; table1B: Array<number | null> }>
> = {
  2024: {
    '337m-110': { table1A: [1250, 980, 430], table1B: [240, 120] },
    '338m-110': { table1A: [1180, 920, 510], table1B: [210, 140] },
    '335m-116': { table1A: [1020, 860, 300], table1B: [180, 90] },
  },
  2025: {
    '337m-110': { table1A: [1320, 1010, 470], table1B: [260, 135] },
    '338m-110': { table1A: [1200, 950, 520], table1B: [225, 155] },
    '336m-116': { table1A: [990, 810, 295], table1B: [170, 88] },
    '339m-117': { table1A: [1110, 875, 345], table1B: [205, 112] },
  },
  2026: {
    '337m-110': { table1A: [1400, 1080, 560], table1B: [280, 165] },
    '338m-110': { table1A: [1275, 970, 590], table1B: [235, 170] },
    '339m-117': { table1A: [1160, 900, 380], table1B: [220, 124] },
  },
};

function cloneTable1ARows(amounts?: Array<number | null>): Ypodeigma1TableARow[] {
  return TABLE_1A_TEMPLATE.map((row, index) => ({
    ...row,
    amount: amounts?.[index] ?? null,
  }));
}

function cloneTable1BRows(amounts?: Array<number | null>): Ypodeigma1TableBRow[] {
  return TABLE_1B_TEMPLATE.map((row, index) => ({
    ...row,
    amount: amounts?.[index] ?? null,
  }));
}

export async function fetchYpodeigma1ForMoira({
  monadaId,
  moiraId,
  etos,
  etosStatus,
  etosSource,
}: FetchYpodeigma1ForMoiraParams): Promise<Ypodeigma1MoiraData> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const isNewYear = etosSource === 'new';
      const yearValues = etos ? EXISTING_YEAR_VALUES[etos]?.[moiraId] : undefined;
      const status = isNewYear ? 'editable' : etosStatus ?? 'editable';

      resolve({
        monadaId,
        monadaLabel: MONADA_LABELS[monadaId] ?? monadaId,
        moiraId,
        moiraLabel: MOIRA_LABELS[moiraId] ?? moiraId,
        etos,
        status,
        table1ARows: cloneTable1ARows(isNewYear ? undefined : yearValues?.table1A),
        table1BRows: cloneTable1BRows(isNewYear ? undefined : yearValues?.table1B),
      });
    }, 300);
  });
}
