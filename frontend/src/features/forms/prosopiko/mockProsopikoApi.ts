import type { ProsopikoRow } from './types';

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

export function fetchProsopikoRows(): Promise<ProsopikoRow[]> {
  return Promise.resolve(MOCK_ROWS.map((row) => ({ ...row })));
}
