import {
  getMoiraAmountKey,
  getOutsideAmountKey,
  MOIRA_COLUMN_TYPES,
  OUTSIDE_COLUMN_TYPES,
} from './helpers';
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

function createEmptyValues(moires: Ypodeigma3Moira[]) {
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
  } satisfies Record<string, number | null>;
}

function createMockRows(moires: Ypodeigma3Moira[]): Ypodeigma3Row[] {
  return MOCK_ROW_DEFINITIONS.map((rowDefinition, index) => ({
    id: `yp3-row-${index + 1}`,
    code: rowDefinition.code,
    costElementTitle: rowDefinition.costElementTitle,
    analysisLevel: rowDefinition.analysisLevel,
    displayOrder: index + 1,
    entryScope: rowDefinition.entryScope,
    values: createEmptyValues(moires),
  }));
}

export function fetchYpodeigma3Config({
  monadaId,
  monadaLabel,
  moiraId,
  moiraLabel,
}: FetchYpodeigma3ConfigParams): Promise<Ypodeigma3Config> {
  const sortedMoires = [{ id: moiraId, label: moiraLabel, displayOrder: 1 }];

  return Promise.resolve({
    unit: {
      id: monadaId,
      name: monadaLabel,
    },
    moires: sortedMoires,
    rows: createMockRows(sortedMoires),
  });
}
