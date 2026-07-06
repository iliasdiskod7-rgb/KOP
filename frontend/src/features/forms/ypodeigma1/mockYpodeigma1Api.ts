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
  '337m-116': '337Μ',
  '338m-116': '338Μ',
  '339m-117': '339Μ',
};

const TABLE_A_TEMPLATE: Ypodeigma1TableARow[] = [
  { id: 'a-1', code: '1.1', title: 'Καύσιμα Αποστολών', amount: null },
  { id: 'a-2', code: '1.2', title: 'Υποστήριξη Πληρωμάτων', amount: null },
  { id: 'a-3', code: '1.3', title: 'Λοιπές Δαπάνες Μοίρας', amount: null },
];

const TABLE_B_TEMPLATE: Ypodeigma1TableBRow[] = [
  { id: 'b-1', code: 'Β.1', title: 'Συγκεντρωτικά Έξοδα Μετακίνησης', amount: null },
  { id: 'b-2', code: 'Β.2', title: 'Συνοδευτικές Δαπάνες', amount: null },
];

function cloneTableARows(): Ypodeigma1TableARow[] {
  return TABLE_A_TEMPLATE.map((row) => ({ ...row }));
}

function cloneTableBRows(): Ypodeigma1TableBRow[] {
  return TABLE_B_TEMPLATE.map((row) => ({ ...row }));
}

export async function fetchYpodeigma1ForMoira({
  monadaId,
  moiraId,
  etos,
}: FetchYpodeigma1ForMoiraParams): Promise<Ypodeigma1MoiraData> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        monadaId,
        monadaLabel: MONADA_LABELS[monadaId] ?? monadaId,
        moiraId,
        moiraLabel: MOIRA_LABELS[moiraId] ?? moiraId,
        etos,
        tableARows: cloneTableARows(),
        tableBRows: cloneTableBRows(),
      });
    }, 300);
  });
}
