import {
  getMoiraAmountKey,
  getOutsideAmountKey,
  MOIRA_COLUMN_TYPES,
  OUTSIDE_COLUMN_TYPES,
} from './helpers';
import type { Ypodeigma3Config, Ypodeigma3EntryScope, Ypodeigma3Moira, Ypodeigma3Row } from './types';

const MOCK_MOIRES: Ypodeigma3Moira[] = [
  { id: '337m', label: '337Μ', displayOrder: 1 },
  { id: '338m', label: '338Μ', displayOrder: 2 },
  { id: '339m', label: '339Μ', displayOrder: 3 },
  { id: '340m', label: '340Μ', displayOrder: 4 },
];

const MOCK_ROW_DEFINITIONS: Array<{
  code: string;
  costElementTitle: string;
  entryScope: Ypodeigma3EntryScope;
}> = [
  { code: '1.1', costElementTitle: 'Πληρώματα Α/Φ', entryScope: 'moira-af-ep' },
  { code: '1.2', costElementTitle: 'Προσωπικό Συντήρησης', entryScope: 'moira-af-ep' },
  { code: '1.2.1', costElementTitle: 'Συντήρηση Κύριου Υλικού', entryScope: 'moira-af-ep' },
  { code: '1.2.2', costElementTitle: 'Συντήρηση Βοηθητικού Υλικού', entryScope: 'moira-af-ep' },
  { code: '1.3', costElementTitle: 'Λοιπές Μετακινήσεις', entryScope: 'outside-moires' },
  { code: '1.3.1', costElementTitle: 'Μετακινήσεις Διοίκησης', entryScope: 'outside-moires' },
  { code: '1.3.2', costElementTitle: 'Μετακινήσεις Υποστήριξης', entryScope: 'outside-moires' },
  { code: '1.3.2.1', costElementTitle: 'Τμήμα Άμεσης Υποστήριξης', entryScope: 'outside-moires' },
  { code: '1.3.2.2', costElementTitle: 'Επιστασία Τεχνικής Κάλυψης', entryScope: 'outside-moires' },
  { code: '1.3.2.3', costElementTitle: 'Επιστασία Εφοδιασμού', entryScope: 'outside-moires' },
  { code: '1.3.2.4', costElementTitle: 'Επιστασία Ασφάλειας Πτήσεων', entryScope: 'outside-moires' },
  { code: '1.3.3', costElementTitle: 'Λοιπές Μετακινήσεις Μονάδας', entryScope: 'outside-moires' },
  { code: '1.3.3.1', costElementTitle: 'Μετακινήσεις Επιτελείου', entryScope: 'outside-moires' },
  { code: '1.3.3.2', costElementTitle: 'Μετακινήσεις Επιμελητείας', entryScope: 'outside-moires' },
  { code: '1.3.3.3', costElementTitle: 'Μετακινήσεις Υπηρεσιών Βάσης', entryScope: 'outside-moires' },
  { code: '1.3.4', costElementTitle: 'Υποστήριξη Πτητικού Έργου', entryScope: 'outside-moires' },
  { code: '1.3.4.1', costElementTitle: 'Ενισχύσεις Υποστήριξης', entryScope: 'outside-moires' },
  { code: '1.3.5', costElementTitle: 'Μετακινήσεις Ειδικών Συνεργείων', entryScope: 'outside-moires' },
  { code: '1.3.6', costElementTitle: 'Μετακινήσεις Λοιπού Προσωπικού', entryScope: 'outside-moires' },
  { code: '6.2', costElementTitle: 'Λοιπά Έξοδα 6.2', entryScope: 'outside-moires' },
  { code: '6.2.1', costElementTitle: 'Έξοδα Κατηγορίας 6.2.1', entryScope: 'outside-moires' },
  { code: '6.2.2', costElementTitle: 'Έξοδα Κατηγορίας 6.2.2', entryScope: 'outside-moires' },
  { code: '6.2.3', costElementTitle: 'Έξοδα Κατηγορίας 6.2.3', entryScope: 'outside-moires' },
  { code: '6.2.4', costElementTitle: 'Έξοδα Κατηγορίας 6.2.4', entryScope: 'outside-moires' },
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
    displayOrder: index + 1,
    entryScope: rowDefinition.entryScope,
    values: createEmptyValues(moires),
  }));
}

export function fetchYpodeigma3Config(): Promise<Ypodeigma3Config> {
  const sortedMoires = [...MOCK_MOIRES].sort((left, right) => left.displayOrder - right.displayOrder);

  return Promise.resolve({
    unit: {
      id: '116pm',
      name: '116ΠΜ',
    },
    moires: sortedMoires,
    rows: createMockRows(sortedMoires),
  });
}
