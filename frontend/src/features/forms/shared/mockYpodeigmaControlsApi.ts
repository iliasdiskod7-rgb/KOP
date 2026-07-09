import type { NewEtosAvailabilityResult, YpodeigmaControlsOptions } from './types';

type MockStartedEtosRecord = {
  ypodeigmaId: number;
  monadaId: string;
  etos: number;
  state: 'temporary-saved' | 'submitted';
};

type CheckNewEtosAvailabilityParams = {
  ypodeigmaId: number;
  monadaId: string;
  etos: number;
};

type StartNewEtosParams = {
  ypodeigmaId: number;
  monadaId: string;
  etos: number;
};

const MOCK_OPTIONS: YpodeigmaControlsOptions = {
  monades: [
    { id: '110pm', name: '110ΠΜ', type: 'monada' },
    { id: '116pm', name: '116ΠΜ', type: 'monada' },
    { id: '117pm', name: '117ΠΜ', type: 'monada' },
  ],
  moires: [
    { id: '337m-110', name: '337Μ', type: 'moira', parentId: '110pm' },
    { id: '338m-110', name: '338Μ', type: 'moira', parentId: '110pm' },
    { id: '335m-116', name: '335Μ', type: 'moira', parentId: '116pm' },
    { id: '336m-116', name: '336Μ', type: 'moira', parentId: '116pm' },
    { id: '339m-117', name: '339Μ', type: 'moira', parentId: '117pm' },
  ],
  etoi: [
    { value: 2024, label: '2024', status: 'view' },
    { value: 2025, label: '2025', status: 'editable' },
    { value: 2026, label: '2026', status: 'view' },
  ],
};

const MOCK_STARTED_ETOS_RECORDS: MockStartedEtosRecord[] = [
  { ypodeigmaId: 1, monadaId: '110pm', etos: 2024, state: 'submitted' },
  { ypodeigmaId: 2, monadaId: '110pm', etos: 2025, state: 'temporary-saved' },
  { ypodeigmaId: 2, monadaId: '116pm', etos: 2024, state: 'submitted' },
  { ypodeigmaId: 3, monadaId: '117pm', etos: 2026, state: 'temporary-saved' },
];

function buildOptionsSnapshot(): YpodeigmaControlsOptions {
  return {
    monades: [...MOCK_OPTIONS.monades],
    moires: [...MOCK_OPTIONS.moires],
    etoi: [...MOCK_OPTIONS.etoi].sort((left, right) => left.value - right.value),
  };
}

export async function fetchYpodeigmaControlsOptions(): Promise<YpodeigmaControlsOptions> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(buildOptionsSnapshot());
    }, 250);
  });
}

export async function checkNewEtosAvailability({
  ypodeigmaId,
  monadaId,
  etos,
}: CheckNewEtosAvailabilityParams): Promise<NewEtosAvailabilityResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const existingRecord = MOCK_STARTED_ETOS_RECORDS.find(
        (record) => record.ypodeigmaId === ypodeigmaId && record.monadaId === monadaId && record.etos === etos,
      );

      if (existingRecord) {
        resolve({
          isAvailable: false,
          message:
            existingRecord.state === 'submitted'
              ? `Το έτος ${etos} υπάρχει ήδη ως οριστικά υποβληθέν για τη συγκεκριμένη μονάδα.`
              : `Το έτος ${etos} υπάρχει ήδη ως προσωρινά αποθηκευμένο για τη συγκεκριμένη μονάδα.`,
        });
        return;
      }

      resolve({
        isAvailable: true,
        message: `Το έτος ${etos} είναι διαθέσιμο για νέα καταχώριση.`,
      });
    }, 250);
  });
}

export async function startNewEtos({
  ypodeigmaId,
  monadaId,
  etos,
}: StartNewEtosParams): Promise<{
  etos: number;
  status: 'editable';
  etosOption: {
    value: number;
    label: string;
    status: 'editable';
  };
}> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const existsAlready = MOCK_STARTED_ETOS_RECORDS.some(
        (record) => record.ypodeigmaId === ypodeigmaId && record.monadaId === monadaId && record.etos === etos,
      );

      if (!existsAlready) {
        MOCK_STARTED_ETOS_RECORDS.push({
          ypodeigmaId,
          monadaId,
          etos,
          state: 'temporary-saved',
        });
      }

      const existingEtosOption = MOCK_OPTIONS.etoi.find((option) => option.value === etos);

      if (!existingEtosOption) {
        MOCK_OPTIONS.etoi.push({
          value: etos,
          label: String(etos),
          status: 'editable',
        });
      }

      resolve({
        etos,
        status: 'editable',
        etosOption: {
          value: etos,
          label: String(etos),
          status: 'editable',
        },
      });
    }, 250);
  });
}
