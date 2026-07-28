import {
  getMoiraAmountKey,
  getOutsideAmountKey,
  MOIRA_COLUMN_TYPES,
  OUTSIDE_COLUMN_TYPES,
} from './helpers';
import type { MoiraColumnType, OutsideColumnType } from './helpers';
import type {
  Ypodeigma3Config,
  Ypodeigma3EntryScope,
  Ypodeigma3Moira,
  Ypodeigma3Row,
} from './types';

type FetchYpodeigma3ConfigParams = {
  monadaId: string;
  monadaLabel: string;
  moiraId: string;
  moiraLabel: string;
  etos: number;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

type MockRowDefinition = {
  code: string;
  costElementTitle: string;
  analysisLevel: number;
  entryScope: Ypodeigma3EntryScope;
};

type MockMoiraValues = Partial<Record<MoiraColumnType, number>>;
type MockOutsideValues = Partial<Record<OutsideColumnType, number>>;

const MOCK_ROW_DEFINITIONS: MockRowDefinition[] = [
  { code: '1.1', costElementTitle: 'Πληρώματα Α/Φ', analysisLevel: 2, entryScope: 'moira-af-ep' },
  { code: '1.2', costElementTitle: 'Προσωπικό Συντήρησης', analysisLevel: 2, entryScope: 'moira-af-ep' },
  { code: '1.2.1', costElementTitle: 'Συντήρηση Κύριου Υλικού', analysisLevel: 3, entryScope: 'moira-af-ep' },
  {
    code: '1.2.2',
    costElementTitle: 'Συντήρηση Βοηθητικού Υλικού',
    analysisLevel: 3,
    entryScope: 'moira-af-ep',
  },
  { code: '1.3', costElementTitle: 'Λοιπές Μετακινήσεις', analysisLevel: 2, entryScope: 'outside-moires' },
  {
    code: '1.3.1',
    costElementTitle: 'Μετακινήσεις Διοίκησης',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.2',
    costElementTitle: 'Μετακινήσεις Υποστήριξης',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.2.1',
    costElementTitle: 'Τμήμα Άμεσης Υποστήριξης',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.2.2',
    costElementTitle: 'Επιστασία Τεχνικής Κάλυψης',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.2.3',
    costElementTitle: 'Επιστασία Εφοδιασμού',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.2.4',
    costElementTitle: 'Επιστασία Ασφάλειας Πτήσεων',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.3',
    costElementTitle: 'Λοιπές Μετακινήσεις Μονάδας',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.3.1',
    costElementTitle: 'Μετακινήσεις Επιτελείου',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.3.2',
    costElementTitle: 'Μετακινήσεις Επιμελητείας',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.3.3',
    costElementTitle: 'Μετακινήσεις Υπηρεσιών Βάσης',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.4',
    costElementTitle: 'Υποστήριξη Πτητικού Έργου',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.4.1',
    costElementTitle: 'Ενισχύσεις Υποστήριξης',
    analysisLevel: 4,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.5',
    costElementTitle: 'Μετακινήσεις Ειδικών Συνεργείων',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '1.3.6',
    costElementTitle: 'Μετακινήσεις Λοιπού Προσωπικού',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  { code: '6.2', costElementTitle: 'Λοιπά Έξοδα 6.2', analysisLevel: 2, entryScope: 'outside-moires' },
  {
    code: '6.2.1',
    costElementTitle: 'Έξοδα Κατηγορίας 6.2.1',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '6.2.2',
    costElementTitle: 'Έξοδα Κατηγορίας 6.2.2',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '6.2.3',
    costElementTitle: 'Έξοδα Κατηγορίας 6.2.3',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
  {
    code: '6.2.4',
    costElementTitle: 'Έξοδα Κατηγορίας 6.2.4',
    analysisLevel: 3,
    entryScope: 'outside-moires',
  },
];

// Προσωρινές τιμές backend για ανακτημένα έτη. Οι parent γραμμές παραμένουν
// κενές, επειδή τα σύνολά τους υπολογίζονται δυναμικά από τα leaf rows.
const MOCK_MOIRA_VALUES_BY_CODE: Record<string, MockMoiraValues> = {
  '1.1': { sd: 24, sa: 20, op: 1_200, opfs: 240 },
  '1.2.1': { sd: 18, sa: 16, op: 840, opfs: 120 },
  '1.2.2': { sd: 10, sa: 8, op: 420, opfs: 60 },
};

const MOCK_OUTSIDE_VALUES_BY_CODE: Record<string, MockOutsideValues> = {
  '1.3.1': { sd: 12, sa: 10 },
  '1.3.2.1': { sd: 8, sa: 7 },
  '1.3.2.2': { sd: 6, sa: 5 },
  '1.3.2.3': { sd: 5, sa: 4 },
  '1.3.2.4': { sd: 4, sa: 3 },
  '1.3.3.1': { sd: 9, sa: 8 },
  '1.3.3.2': { sd: 7, sa: 6 },
  '1.3.3.3': { sd: 11, sa: 9 },
  '1.3.4.1': { sd: 14, sa: 12 },
  '1.3.5': { sd: 6, sa: 5 },
  '1.3.6': { sd: 5, sa: 4 },
  '6.2.1': { sd: 8, sa: 7 },
  '6.2.2': { sd: 7, sa: 6 },
  '6.2.3': { sd: 6, sa: 5 },
  '6.2.4': { sd: 5, sa: 4 },
};

function createEmptyValues(moires: Ypodeigma3Moira[]): Record<string, number | null> {
  const outsideValues = Object.fromEntries(
    OUTSIDE_COLUMN_TYPES.map((columnType) => [getOutsideAmountKey(columnType), null]),
  );
  const moiraValues = Object.fromEntries(
    moires.flatMap((moira) =>
      MOIRA_COLUMN_TYPES.map((columnType) => [getMoiraAmountKey(moira.id, columnType), null]),
    ),
  );

  return {
    ...outsideValues,
    ...moiraValues,
  };
}

function createMockValues(
  rowDefinition: MockRowDefinition,
  moires: Ypodeigma3Moira[],
  includeExistingValues: boolean,
) {
  const values = createEmptyValues(moires);

  if (!includeExistingValues) {
    return values;
  }

  if (rowDefinition.entryScope === 'moira-af-ep') {
    const mockValues = MOCK_MOIRA_VALUES_BY_CODE[rowDefinition.code];

    if (!mockValues) {
      return values;
    }

    moires.forEach((moira) => {
      MOIRA_COLUMN_TYPES.forEach((columnType) => {
        const value = mockValues[columnType];

        if (value !== undefined) {
          values[getMoiraAmountKey(moira.id, columnType)] = value;
        }
      });
    });

    return values;
  }

  const mockValues = MOCK_OUTSIDE_VALUES_BY_CODE[rowDefinition.code];

  if (!mockValues) {
    return values;
  }

  OUTSIDE_COLUMN_TYPES.forEach((columnType) => {
    const value = mockValues[columnType];

    if (value !== undefined) {
      values[getOutsideAmountKey(columnType)] = value;
    }
  });

  return values;
}

function createMockRows(
  moires: Ypodeigma3Moira[],
  includeExistingValues: boolean,
): Ypodeigma3Row[] {
  return MOCK_ROW_DEFINITIONS.map((rowDefinition, index) => ({
    id: `yp3-row-${index + 1}`,
    code: rowDefinition.code,
    costElementTitle: rowDefinition.costElementTitle,
    analysisLevel: rowDefinition.analysisLevel,
    displayOrder: index + 1,
    entryScope: rowDefinition.entryScope,
    values: createMockValues(rowDefinition, moires, includeExistingValues),
  }));
}

export function fetchYpodeigma3Config({
  monadaId,
  monadaLabel,
  moiraId,
  moiraLabel,
  etosSource,
}: FetchYpodeigma3ConfigParams): Promise<Ypodeigma3Config> {
  const sortedMoires = [{ id: moiraId, label: moiraLabel, displayOrder: 1 }];
  const includeExistingValues = etosSource !== 'new';

  return Promise.resolve({
    unit: {
      id: monadaId,
      name: monadaLabel,
    },
    moires: sortedMoires,
    rows: createMockRows(sortedMoires, includeExistingValues),
  });
}
