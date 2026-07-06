import { getAmountKey } from './helpers';
import type { Ypodeigma2AmountMap, Ypodeigma2Moira, Ypodeigma2Row, Ypodeigma2SectionConfig } from './types';

type FetchYpodeigma2SectionParams = {
  sectionId: string;
  moiraId: string;
  etos: number | null;
  etosStatus: 'editable' | 'view' | null;
  etosSource: 'existing' | 'new' | null;
};

type MoiraDefinition = {
  id: string;
  label: string;
  displayOrder: number;
  alePrefix: string;
};

const MOIRA_DEFINITIONS: MoiraDefinition[] = [
  { id: '337m-110', label: '337Μ', displayOrder: 1, alePrefix: '110337' },
  { id: '338m-110', label: '338Μ', displayOrder: 2, alePrefix: '110338' },
  { id: '335m-116', label: '335Μ', displayOrder: 3, alePrefix: '116335' },
  { id: '336m-116', label: '336Μ', displayOrder: 4, alePrefix: '116336' },
  { id: '339m-117', label: '339Μ', displayOrder: 5, alePrefix: '117339' },
];

const ANALYSIS_LEVELS = [
  { id: 'analysis-1', value: 1, label: '1', displayOrder: 1 },
  { id: 'analysis-2', value: 2, label: '2', displayOrder: 2 },
  { id: 'analysis-3', value: 3, label: '3', displayOrder: 3 },
  { id: 'analysis-4', value: 4, label: '4', displayOrder: 4 },
  { id: 'analysis-5', value: 5, label: '5', displayOrder: 5 },
  { id: 'analysis-6', value: 6, label: '6', displayOrder: 6 },
];

const SECTION_1A_TEMPLATE = [
  {
    id: 'row-1a-1',
    code: '1.1',
    costElementTitle: 'Πληρώματα Μοίρας Α/Φ-Ε/Π',
    analysisLevel: 1,
    displayOrder: 1,
  },
  {
    id: 'row-1a-2',
    code: '1.2',
    costElementTitle: 'Προσωπικό Συντήρησης',
    analysisLevel: 2,
    displayOrder: 2,
  },
  {
    id: 'row-1a-3',
    code: '1.2.1',
    costElementTitle: 'Προσωπικό Συντήρησης D-Level',
    analysisLevel: 3,
    displayOrder: 3,
  },
] satisfies Array<Omit<Ypodeigma2Row, 'values'>>;

const SECTION_1B_TEMPLATE = [
  {
    id: 'row-1b-1',
    code: '1.2.2',
    costElementTitle: 'Τίτλος στοιχείου κόστους 1.2.2',
    analysisLevel: 3,
    displayOrder: 1,
  },
  {
    id: 'row-1b-2',
    code: '1.3',
    costElementTitle: 'Τίτλος στοιχείου κόστους 1.3',
    analysisLevel: 2,
    displayOrder: 2,
  },
] satisfies Array<Omit<Ypodeigma2Row, 'values'>>;

function buildMoires(): Ypodeigma2Moira[] {
  return MOIRA_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    displayOrder: definition.displayOrder,
    ales: [1, 2, 3, 4].map((index) => ({
      id: `${definition.alePrefix}-ale-${index}`,
      code: `${100 + index}`,
      label: `ΑΛΕ ${100 + index}`,
      displayOrder: index,
    })),
  }));
}

function createEmptyValues(moires: Ypodeigma2Moira[]): Ypodeigma2AmountMap {
  return moires.reduce<Ypodeigma2AmountMap>((amounts, moira) => {
    moira.ales.forEach((ale) => {
      amounts[getAmountKey(moira.id, ale.id)] = null;
    });

    return amounts;
  }, {});
}

function createMockValue(
  year: number,
  rowDisplayOrder: number,
  moiraDisplayOrder: number,
  aleDisplayOrder: number,
) {
  return year % 100 + rowDisplayOrder * 27 + moiraDisplayOrder * 19 + aleDisplayOrder * 11;
}

function buildRowValues(
  rowDisplayOrder: number,
  year: number | null,
  isNewYear: boolean,
  moires: Ypodeigma2Moira[],
): Ypodeigma2AmountMap {
  const values = createEmptyValues(moires);

  if (isNewYear || !year) {
    return values;
  }

  moires.forEach((moira) => {
    moira.ales.forEach((ale) => {
      values[getAmountKey(moira.id, ale.id)] = createMockValue(
        year,
        rowDisplayOrder,
        moira.displayOrder,
        ale.displayOrder,
      );
    });
  });

  return values;
}

function buildRows(
  template: Array<Omit<Ypodeigma2Row, 'values'>>,
  year: number | null,
  isNewYear: boolean,
  moires: Ypodeigma2Moira[],
): Ypodeigma2Row[] {
  return template.map((row) => ({
    ...row,
    values: buildRowValues(row.displayOrder, year, isNewYear, moires),
  }));
}

function createMockSectionConfig(
  year: number | null,
  status: 'editable' | 'view',
  isNewYear: boolean,
): Ypodeigma2SectionConfig {
  const moires = buildMoires();
  const section1ARows = buildRows(SECTION_1A_TEMPLATE, year, isNewYear, moires);
  const section1BRows = buildRows(SECTION_1B_TEMPLATE, year, isNewYear, moires);

  return {
    sectionId: '1Α',
    sectionTitle: '1Α. Οδοιπορικά Έξοδα Μετασταθμεύσεων',
    status,
    analysisLevels: ANALYSIS_LEVELS,
    moires,
    rows: section1ARows,
    section1B: {
      sectionId: '1Β',
      sectionTitle:
        '1Β. Οδοιπορικά Έξοδα Μετακινήσεων Λοιπών Μοιρών-Επιστασιών-Τμημάτων Άμεσης Υποστήριξης Πτητικού Έργου',
      rows: section1BRows,
    },
  };
}

export async function fetchYpodeigma2Section({
  sectionId,
  moiraId,
  etos,
  etosStatus,
  etosSource,
}: FetchYpodeigma2SectionParams): Promise<Ypodeigma2SectionConfig> {
  const isNewYear = etosSource === 'new';
  const status = isNewYear ? 'editable' : etosStatus ?? 'editable';
  const config = createMockSectionConfig(etos, status, isNewYear);
  const selectedMoira = config.moires.find((moira) => moira.id === moiraId);

  return Promise.resolve({
    ...config,
    sectionId,
    sectionTitle: `${sectionId}. Οδοιπορικά Έξοδα Μετασταθμεύσεων`,
    moires: selectedMoira ? [selectedMoira] : config.moires,
  });
}
