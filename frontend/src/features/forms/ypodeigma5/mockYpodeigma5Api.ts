import type { Ypodeigma5Config, Ypodeigma5ResponsiblePerson } from './types';

type FetchYpodeigma5ConfigParams = {
  monadaId: string;
  monadaLabel: string;
  etos: number;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

const MOCK_RESPONSIBLE_PERSONS: Ypodeigma5ResponsiblePerson[] = [
  {
    id: 'kop-person-1',
    displayOrder: 1,
    referenceTemplate: 2,
    rank: 'Σγός',
    militaryRegistryNumber: '12243',
    fullName: 'Γρηγόριος Δίσκος',
    department: 'ΑΤΑ/ΓΜ.ΠΡ',
    phone: '610-43924432',
  },
  {
    id: 'kop-person-2',
    displayOrder: 2,
    referenceTemplate: 3,
    rank: 'Επγός',
    militaryRegistryNumber: '13582',
    fullName: 'Ιωάννης Παπαδόπουλος',
    department: '337Μ/Γραφείο ΚΩΠ',
    phone: '610-43924501',
  },
  {
    id: 'kop-person-3',
    displayOrder: 3,
    referenceTemplate: 4,
    rank: 'Σμχος',
    militaryRegistryNumber: '11876',
    fullName: 'Νικόλαος Γεωργίου',
    department: '110ΜΣΒ/Επιστασία ΕΩ',
    phone: '610-43924518',
  },
  {
    id: 'kop-person-4',
    displayOrder: 4,
    referenceTemplate: 2,
    rank: 'Υπσγός',
    militaryRegistryNumber: '14721',
    fullName: 'Δημήτριος Κωνσταντίνου',
    department: '338Μ/Τμήμα Προσωπικού',
    phone: '610-43924537',
  },
  {
    id: 'kop-person-5',
    displayOrder: 5,
    referenceTemplate: 3,
    rank: 'Ασμίας',
    militaryRegistryNumber: '20345',
    fullName: 'Αλέξανδρος Νικολάου',
    department: '110ΠΜ/Γραφείο Οικονομικού',
    phone: '610-43924562',
  },
  {
    id: 'kop-person-6',
    displayOrder: 6,
    referenceTemplate: 4,
    rank: 'Ανθσγός',
    militaryRegistryNumber: '15439',
    fullName: 'Παναγιώτης Αντωνίου',
    department: '337Μ/Επιστασία Συντήρησης',
    phone: '610-43924584',
  },
  {
    id: 'kop-person-7',
    displayOrder: 7,
    referenceTemplate: 2,
    rank: 'Σγός',
    militaryRegistryNumber: '12994',
    fullName: 'Χρήστος Δημητρίου',
    department: '338Μ/Γραφείο Επιχειρήσεων',
    phone: '610-43924603',
  },
  {
    id: 'kop-person-8',
    displayOrder: 8,
    referenceTemplate: 3,
    rank: 'Εσμίας',
    militaryRegistryNumber: '21867',
    fullName: 'Αναστάσιος Βασιλείου',
    department: '110ΜΣΒ/Τμήμα Υποστήριξης',
    phone: '610-43924625',
  },
  {
    id: 'kop-person-9',
    displayOrder: 9,
    referenceTemplate: 4,
    rank: 'Επγός',
    militaryRegistryNumber: '13705',
    fullName: 'Σπυρίδων Θεοδώρου',
    department: '110ΠΜ/Επιστασία Ελέγχου',
    phone: '610-43924649',
  },
  {
    id: 'kop-person-10',
    displayOrder: 10,
    referenceTemplate: 2,
    rank: 'Σμίας',
    militaryRegistryNumber: '22614',
    fullName: 'Ευάγγελος Μιχαήλ',
    department: '337Μ/Γραφείο Διοικητικού',
    phone: '610-43924671',
  },
];

export async function fetchYpodeigma5Config({
  monadaId,
  monadaLabel,
  etos,
  etosStatus,
  etosSource,
}: FetchYpodeigma5ConfigParams): Promise<Ypodeigma5Config> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));

  const rows =
    etosSource === 'new'
      ? [
          {
            ...MOCK_RESPONSIBLE_PERSONS[0],
            id: `ypodeigma5-new-${etos}-1`,
            displayOrder: 1,
            referenceTemplate: null,
            rank: '',
            militaryRegistryNumber: '',
            fullName: '',
            department: '',
            phone: '',
          },
        ]
      : MOCK_RESPONSIBLE_PERSONS.map((row) => ({ ...row }));

  return {
    unit: {
      id: monadaId,
      name: monadaLabel,
    },
    etos,
    status: etosSource === 'new' ? 'editable' : (etosStatus ?? 'view'),
    rows,
  };
}
