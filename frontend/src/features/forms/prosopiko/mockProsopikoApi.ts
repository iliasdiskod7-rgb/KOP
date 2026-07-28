import type { ProsopikoClassificationOption, ProsopikoConfig, ProsopikoRow } from './types';

const MOCK_ROWS: ProsopikoRow[] = [
  {
    id: 'prosopiko-1',
    displayOrder: 1,
    vathmos: 'ΣΓΟΣ',
    eid: 'ΙΠΤ',
    eponymo: 'Παπαδόπουλος',
    onoma: 'Ιωάννης',
    ama: '12345',
    epiteleioMonadaYpiresia: '116ΠΜ',
    kladosMoiraAllo: '337Μ',
    dieythynsiEpistasiaAllo: 'Διεύθυνση Επιχειρήσεων',
    tmimaGrafeioAllo: 'Γραφείο Εκπαίδευσης',
    apo: '2026-06-01',
    eos: '2026-06-10',
    taxinomisiKodikaPinaka1Kai62: '1.1',
    movementType: 'Τοποθέτηση',
    imeres: 10,
  },
  {
    id: 'prosopiko-2',
    displayOrder: 2,
    vathmos: 'ΣΓΟΣ',
    eid: 'ΙΠΤ',
    eponymo: 'Παπαδόπουλος',
    onoma: 'Ιωάννης',
    ama: '12345',
    epiteleioMonadaYpiresia: '116ΠΜ',
    kladosMoiraAllo: '337Μ',
    dieythynsiEpistasiaAllo: 'Διεύθυνση Επιχειρήσεων',
    tmimaGrafeioAllo: 'Γραφείο Εκπαίδευσης',
    apo: '2026-06-04',
    eos: '2026-06-06',
    taxinomisiKodikaPinaka1Kai62: '1.1.1',
    movementType: 'Απόσπαση',
    imeres: 3,
  },
  {
    id: 'prosopiko-3',
    displayOrder: 3,
    vathmos: 'ΕΠΓΟΣ',
    eid: 'ΤΕΧ',
    eponymo: 'Κωνσταντίνου',
    onoma: 'Μαρία',
    ama: '23456',
    epiteleioMonadaYpiresia: '117ΠΜ',
    kladosMoiraAllo: '338Μ',
    dieythynsiEpistasiaAllo: 'Επιστασία Συντήρησης',
    tmimaGrafeioAllo: 'Τμήμα Υποστήριξης',
    apo: '2026-06-07',
    eos: '2026-06-09',
    taxinomisiKodikaPinaka1Kai62: '1.2',
    movementType: 'Τοποθέτηση',
    imeres: 3,
  },
  {
    id: 'prosopiko-4',
    displayOrder: 4,
    vathmos: 'ΑΝΘΣΓΟΣ',
    eid: 'ΔΙΑΧ',
    eponymo: 'Νικολάου',
    onoma: 'Ελένη',
    ama: '34567',
    epiteleioMonadaYpiresia: '110ΠΜ',
    kladosMoiraAllo: 'Κλάδος Υποστήριξης',
    dieythynsiEpistasiaAllo: 'Διεύθυνση Μέριμνας',
    tmimaGrafeioAllo: 'Γραφείο Κίνησης',
    apo: '2026-06-10',
    eos: '2026-06-12',
    taxinomisiKodikaPinaka1Kai62: '2.2',
    movementType: 'Τοποθέτηση',
    imeres: 3,
  },
];

const MOCK_CLASSIFICATION_OPTIONS: ProsopikoClassificationOption[] = [
  { code: '1', description: 'Γενική κατηγορία' },
  { code: '1.1', description: 'Πληρώματα Α/Φ' },
  { code: '1.1.1', description: 'Κυβερνήτες' },
  { code: '1.1.2', description: 'Συγκυβερνήτες' },
  { code: '1.2', description: 'Προσωπικό συντήρησης' },
  { code: '1.2.1', description: 'Συντήρηση D-Level' },
  { code: '1.2.2', description: 'Συντήρηση λοιπών κλιμακίων' },
  { code: '1.3', description: 'Λοιπές μετακινήσεις' },
  { code: '1.3.1', description: 'Μετακινήσεις διοίκησης' },
  { code: '1.3.2', description: 'Μετακινήσεις υποστήριξης' },
  { code: '1.3.2.1', description: 'Τμήμα άμεσης υποστήριξης' },
  { code: '1.3.2.2', description: 'Επιστασία τεχνικής κάλυψης' },
  { code: '2', description: 'Πίνακας 6.2 γενική κατηγορία' },
  { code: '2.1', description: 'Κατηγορία 6.2.1' },
  { code: '2.1.1', description: 'Υποκατηγορία 6.2.1.1' },
  { code: '2.2', description: 'Κατηγορία 6.2.2' },
];

type FetchProsopikoConfigParams = {
  monadaId: string;
  monadaLabel: string;
  etos: number;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

function createEmptyProsopikoRow(etos: number): ProsopikoRow {
  return {
    id: `prosopiko-new-${etos}-1`,
    displayOrder: 1,
    vathmos: '',
    eid: '',
    eponymo: '',
    onoma: '',
    ama: '',
    epiteleioMonadaYpiresia: '',
    kladosMoiraAllo: '',
    dieythynsiEpistasiaAllo: '',
    tmimaGrafeioAllo: '',
    apo: '',
    eos: '',
    taxinomisiKodikaPinaka1Kai62: '',
    movementType: null,
    imeres: null,
  };
}

export async function fetchProsopikoConfig({
  monadaId,
  monadaLabel,
  etos,
  etosStatus,
  etosSource,
}: FetchProsopikoConfigParams): Promise<ProsopikoConfig> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));

  return {
    unit: {
      id: monadaId,
      name: monadaLabel,
    },
    etos,
    status: etosSource === 'new' ? 'editable' : (etosStatus ?? 'view'),
    rows:
      etosSource === 'new'
        ? [createEmptyProsopikoRow(etos)]
        : MOCK_ROWS.map((row) => ({ ...row })),
  };
}

export function fetchProsopikoClassificationOptions(): Promise<ProsopikoClassificationOption[]> {
  return Promise.resolve(MOCK_CLASSIFICATION_OPTIONS.map((option) => ({ ...option })));
}
