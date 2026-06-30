import type { ProsopikoClassificationOption, ProsopikoRow } from './types';

const MOCK_ROWS: ProsopikoRow[] = [
  {
    id: 'prosopiko-1',
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
    eos: '2026-06-05',
    taxinomisiKodikaPinaka1Kai62: '',
    imeres: 5,
  },
  {
    id: 'prosopiko-2',
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
    taxinomisiKodikaPinaka1Kai62: '',
    imeres: 3,
  },
  {
    id: 'prosopiko-3',
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
    taxinomisiKodikaPinaka1Kai62: '',
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

export function fetchProsopikoRows(): Promise<ProsopikoRow[]> {
  return Promise.resolve(MOCK_ROWS.map((row) => ({ ...row })));
}

export function fetchProsopikoClassificationOptions(): Promise<ProsopikoClassificationOption[]> {
  return Promise.resolve(MOCK_CLASSIFICATION_OPTIONS.map((option) => ({ ...option })));
}
