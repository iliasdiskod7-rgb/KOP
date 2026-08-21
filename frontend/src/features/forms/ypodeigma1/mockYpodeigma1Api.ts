import type {
  FetchYpodeigma1ForMoiraParams,
  Ypodeigma1MoiraData,
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
  Ypodeigma1TableCRow,
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

const TABLE_1A_TEMPLATE: Omit<Ypodeigma1TableARow, 'amount'>[] = [
  { id: '1a-1', code: '1', title: 'Σύνολο Μικτών Αποδοχών Μοίρας', analysisLevel: 1 },
  { id: '1a-2', code: '1.1', title: 'Μικτές Αποδοχές Πληρωμάτων Α/Φ', analysisLevel: 2 },
  { id: '1a-3', code: '1.2', title: 'Προσωπικό Συντήρησης Μοιρών Α/Φ-Ε/Π', analysisLevel: 2 },
  { id: '1a-4', code: '1.2.1', title: 'Τεχνικοί Συντήρησης', analysisLevel: 3 },
  { id: '1a-5', code: '1.2.2', title: 'Λοιπό Προσωπικό Υποστήριξης', analysisLevel: 3 },
];

const TABLE_1B_TEMPLATE: Omit<Ypodeigma1TableBRow, 'amount'>[] = [
  { id: '1b-1', code: '1', title: 'Σύνολο Λοιπών Μικτών Αποδοχών', analysisLevel: 1 },
  { id: '1b-2', code: '1.1', title: 'Μικτές Αποδοχές Επιστασιών', analysisLevel: 2 },
  { id: '1b-3', code: '1.2', title: 'Μικτές Αποδοχές Τμημάτων Άμεσης Υποστήριξης', analysisLevel: 2 },
  { id: '1b-4', code: '1.2.1', title: 'Τμήμα Επιχειρήσεων', analysisLevel: 3 },
  { id: '1b-5', code: '1.2.2', title: 'Τμήμα Διοικητικής Υποστήριξης', analysisLevel: 3 },
];

const TABLE_1C_TEMPLATE: Omit<Ypodeigma1TableCRow, 'amount'>[] = [
  { id: '1c-1', code: '1', title: 'Σύνολο Έμμεσης Υποστήριξης', analysisLevel: 1 },
  { id: '1c-2', code: '1.1', title: 'Μικτές Αποδοχές Διοικητικής Μέριμνας', analysisLevel: 2 },
  { id: '1c-3', code: '1.2', title: 'Μικτές Αποδοχές Υποστηρικτικών Τμημάτων', analysisLevel: 2 },
  { id: '1c-4', code: '1.2.1', title: 'Τμήμα Οικονομικού', analysisLevel: 3 },
  { id: '1c-5', code: '1.2.2', title: 'Τμήμα Γραμματείας / Μέριμνας', analysisLevel: 3 },
];

type ExistingYearValues = {
  table1A: Record<string, number | null>;
  table1B: Record<string, number | null>;
  table1C: Record<string, number | null>;
};

const EXISTING_YEAR_VALUES: Record<number, Record<string, ExistingYearValues>> = {
  2024: {
    '337m-110': {
      table1A: { '1a-2': 1250, '1a-4': 640, '1a-5': 340 },
      table1B: { '1b-2': 240, '1b-4': 120, '1b-5': 75 },
      table1C: { '1c-2': 190, '1c-4': 95, '1c-5': 60 },
    },
    '338m-110': {
      table1A: { '1a-2': 1180, '1a-4': 590, '1a-5': 330 },
      table1B: { '1b-2': 210, '1b-4': 110, '1b-5': 92 },
      table1C: { '1c-2': 175, '1c-4': 84, '1c-5': 58 },
    },
    '335m-116': {
      table1A: { '1a-2': 1020, '1a-4': 510, '1a-5': 300 },
      table1B: { '1b-2': 180, '1b-4': 90, '1b-5': 70 },
      table1C: { '1c-2': 150, '1c-4': 70, '1c-5': 52 },
    },
  },
  2025: {
    '337m-110': {
      table1A: { '1a-2': 1320, '1a-4': 690, '1a-5': 360 },
      table1B: { '1b-2': 260, '1b-4': 135, '1b-5': 86 },
      table1C: { '1c-2': 205, '1c-4': 104, '1c-5': 67 },
    },
    '338m-110': {
      table1A: { '1a-2': 1200, '1a-4': 620, '1a-5': 350 },
      table1B: { '1b-2': 225, '1b-4': 118, '1b-5': 93 },
      table1C: { '1c-2': 182, '1c-4': 91, '1c-5': 61 },
    },
    '336m-116': {
      table1A: { '1a-2': 990, '1a-4': 505, '1a-5': 305 },
      table1B: { '1b-2': 170, '1b-4': 88, '1b-5': 66 },
      table1C: { '1c-2': 146, '1c-4': 72, '1c-5': 48 },
    },
    '339m-117': {
      table1A: { '1a-2': 1110, '1a-4': 560, '1a-5': 315 },
      table1B: { '1b-2': 205, '1b-4': 112, '1b-5': 74 },
      table1C: { '1c-2': 168, '1c-4': 80, '1c-5': 55 },
    },
  },
  2026: {
    '337m-110': {
      table1A: { '1a-2': 1400, '1a-4': 720, '1a-5': 390 },
      table1B: { '1b-2': 280, '1b-4': 165, '1b-5': 96 },
      table1C: { '1c-2': 218, '1c-4': 110, '1c-5': 72 },
    },
    '338m-110': {
      table1A: { '1a-2': 1275, '1a-4': 650, '1a-5': 365 },
      table1B: { '1b-2': 235, '1b-4': 132, '1b-5': 88 },
      table1C: { '1c-2': 190, '1c-4': 95, '1c-5': 64 },
    },
    '339m-117': {
      table1A: { '1a-2': 1160, '1a-4': 590, '1a-5': 340 },
      table1B: { '1b-2': 220, '1b-4': 124, '1b-5': 82 },
      table1C: { '1c-2': 176, '1c-4': 89, '1c-5': 59 },
    },
  },
};

function cloneTable1ARows(amounts?: Record<string, number | null>): Ypodeigma1TableARow[] {
  return TABLE_1A_TEMPLATE.map((row) => ({
    ...row,
    amount: amounts?.[row.id] ?? null,
  }));
}

function cloneTable1BRows(amounts?: Record<string, number | null>): Ypodeigma1TableBRow[] {
  return TABLE_1B_TEMPLATE.map((row) => ({
    ...row,
    amount: amounts?.[row.id] ?? null,
  }));
}

function cloneTable1CRows(amounts?: Record<string, number | null>): Ypodeigma1TableCRow[] {
  return TABLE_1C_TEMPLATE.map((row) => ({
    ...row,
    amount: amounts?.[row.id] ?? null,
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
        responsibleOrgUnitId: null,
        monadaId,
        monadaLabel: MONADA_LABELS[monadaId] ?? monadaId,
        moiraId,
        moiraLabel: MOIRA_LABELS[moiraId] ?? moiraId,
        etos,
        status,
        table1ARows: cloneTable1ARows(isNewYear ? undefined : yearValues?.table1A),
        table1BRows: cloneTable1BRows(isNewYear ? undefined : yearValues?.table1B),
        table1CRows: cloneTable1CRows(isNewYear ? undefined : yearValues?.table1C),
      });
    }, 300);
  });
}
