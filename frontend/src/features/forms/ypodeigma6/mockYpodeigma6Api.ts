import type { Ypodeigma6Config, Ypodeigma6Row } from './types';

type FetchYpodeigma6ConfigParams = {
  monadaId: string;
  monadaLabel: string;
  etos: number;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

const MOCK_ROWS: Ypodeigma6Row[] = [
  {
    id: 'ypodeigma6-row-1',
    displayOrder: 1,
    description: 'Καύσιμα πτητικών μέσων',
    sntTotalFlightHours: 420,
    measurementUnit: 'LT',
    quantity: 18500,
    aircraftSquadron: '337Μ',
    aircraftType: 'F-16',
    costPerUnit: 1.82,
    notes: 'Ετήσια εκτίμηση κατανάλωσης',
  },
  {
    id: 'ypodeigma6-row-2',
    displayOrder: 2,
    description: 'Λιπαντικά κινητήρων',
    sntTotalFlightHours: 420,
    measurementUnit: 'LT',
    quantity: 760,
    aircraftSquadron: '337Μ',
    aircraftType: 'F-16',
    costPerUnit: 8.45,
    notes: 'Προγραμματισμένη συντήρηση',
  },
  {
    id: 'ypodeigma6-row-3',
    displayOrder: 3,
    description: 'Ανταλλακτικά συστήματος προσγείωσης',
    sntTotalFlightHours: 315,
    measurementUnit: 'ΤΕΜ',
    quantity: 24,
    aircraftSquadron: '338Μ',
    aircraftType: 'F-16',
    costPerUnit: 1280,
    notes: 'Απόθεμα ασφαλείας',
  },
  {
    id: 'ypodeigma6-row-4',
    displayOrder: 4,
    description: 'Φίλτρα αέρος',
    sntTotalFlightHours: 315,
    measurementUnit: 'ΤΕΜ',
    quantity: 96,
    aircraftSquadron: '338Μ',
    aircraftType: 'F-16',
    costPerUnit: 74.5,
    notes: 'Αλλαγή βάσει ωρών πτήσης',
  },
  {
    id: 'ypodeigma6-row-5',
    displayOrder: 5,
    description: 'Υλικά επίγειας υποστήριξης',
    sntTotalFlightHours: 260,
    measurementUnit: 'ΣΕΤ',
    quantity: 12,
    aircraftSquadron: '339Μ',
    aircraftType: 'F-4E',
    costPerUnit: 2150,
    notes: 'Εξοπλισμός συνεργείου',
  },
];

function createEmptyRow(etos: number): Ypodeigma6Row {
  return {
    id: `ypodeigma6-new-${etos}-1`,
    displayOrder: 1,
    description: '',
    sntTotalFlightHours: null,
    measurementUnit: '',
    quantity: null,
    aircraftSquadron: '',
    aircraftType: '',
    costPerUnit: null,
    notes: '',
  };
}

export async function fetchYpodeigma6Config({
  monadaId,
  monadaLabel,
  etos,
  etosStatus,
  etosSource,
}: FetchYpodeigma6ConfigParams): Promise<Ypodeigma6Config> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));

  return {
    unit: {
      id: monadaId,
      name: monadaLabel,
    },
    etos,
    status: etosSource === 'new' ? 'editable' : (etosStatus ?? 'view'),
    rows: etosSource === 'new' ? [createEmptyRow(etos)] : MOCK_ROWS.map((row) => ({ ...row })),
  };
}
