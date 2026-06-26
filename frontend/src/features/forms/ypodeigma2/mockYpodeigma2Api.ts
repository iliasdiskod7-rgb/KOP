import { getAmountKey } from './helpers';
import type { Ypodeigma2SectionConfig } from './types';

function createEmptyValues() {
  return {
    [getAmountKey('337m', 'ale-101')]: null,
    [getAmountKey('337m', 'ale-102')]: null,
    [getAmountKey('337m', 'ale-103')]: null,
    [getAmountKey('337m', 'ale-104')]: null,
    [getAmountKey('338m', 'ale-201')]: null,
    [getAmountKey('338m', 'ale-202')]: null,
    [getAmountKey('338m', 'ale-203')]: null,
    [getAmountKey('338m', 'ale-204')]: null,
  };
}

function createMockSectionConfig(): Ypodeigma2SectionConfig {
  const analysisLevels = [
    { id: 'analysis-1', value: 1, label: '1', displayOrder: 1 },
    { id: 'analysis-2', value: 2, label: '2', displayOrder: 2 },
    { id: 'analysis-3', value: 3, label: '3', displayOrder: 3 },
    { id: 'analysis-4', value: 4, label: '4', displayOrder: 4 },
    { id: 'analysis-5', value: 5, label: '5', displayOrder: 5 },
    { id: 'analysis-6', value: 6, label: '6', displayOrder: 6 },
  ];

  const moires = [
    {
      id: '337m',
      label: '337μ',
      displayOrder: 1,
      ales: [
        { id: 'ale-101', code: '101', label: 'ΑΛΕ 101', displayOrder: 1 },
        { id: 'ale-102', code: '102', label: 'ΑΛΕ 102', displayOrder: 2 },
        { id: 'ale-103', code: '103', label: 'ΑΛΕ 103', displayOrder: 3 },
        { id: 'ale-104', code: '104', label: 'ΑΛΕ 104', displayOrder: 4 },
      ],
    },
    {
      id: '338m',
      label: '338μ',
      displayOrder: 2,
      ales: [
        { id: 'ale-201', code: '101', label: 'ΑΛΕ 101', displayOrder: 1 },
        { id: 'ale-202', code: '102', label: 'ΑΛΕ 102', displayOrder: 2 },
        { id: 'ale-203', code: '103', label: 'ΑΛΕ 103', displayOrder: 3 },
        { id: 'ale-204', code: '104', label: 'ΑΛΕ 104', displayOrder: 4 },
      ],
    },
  ];

  const section1ARows = [
    {
      id: 'row-1a-1',
      code: '1.1',
      costElementTitle: 'Πληρώματα Μοίρας Α/Φ-Ε/Π',
      analysisLevel: 1,
      displayOrder: 1,
      values: createEmptyValues(),
    },
    {
      id: 'row-1a-2',
      code: '1.2',
      costElementTitle: 'Προσωπικό Συντήρησης',
      analysisLevel: 2,
      displayOrder: 2,
      values: createEmptyValues(),
    },
    {
      id: 'row-1a-3',
      code: '1.2.1',
      costElementTitle: 'Προσωπικό Συντήρησης D-Level',
      analysisLevel: 3,
      displayOrder: 3,
      values: createEmptyValues(),
    },
  ];

  const section1BRows = [
    { id: 'row-1b-1', code: '1.2.2', costElementTitle: 'Τίτλος στοιχείου κόστους 1.2.2', analysisLevel: 3, displayOrder: 1, values: createEmptyValues() },
    { id: 'row-1b-2', code: '1.3', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3', analysisLevel: 2, displayOrder: 2, values: createEmptyValues() },
    { id: 'row-1b-3', code: '1.3.1', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.1', analysisLevel: 3, displayOrder: 3, values: createEmptyValues() },
    { id: 'row-1b-4', code: '1.3.2', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.2', analysisLevel: 3, displayOrder: 4, values: createEmptyValues() },
    { id: 'row-1b-5', code: '1.3.2.1', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.2.1', analysisLevel: 4, displayOrder: 5, values: createEmptyValues() },
    { id: 'row-1b-6', code: '1.3.2.2', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.2.2', analysisLevel: 4, displayOrder: 6, values: createEmptyValues() },
    { id: 'row-1b-7', code: '1.3.2.3', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.2.3', analysisLevel: 4, displayOrder: 7, values: createEmptyValues() },
    { id: 'row-1b-8', code: '1.3.2.4', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.2.4', analysisLevel: 4, displayOrder: 8, values: createEmptyValues() },
    { id: 'row-1b-9', code: '1.3.3', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.3', analysisLevel: 3, displayOrder: 9, values: createEmptyValues() },
    { id: 'row-1b-10', code: '1.3.3.1', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.3.1', analysisLevel: 4, displayOrder: 10, values: createEmptyValues() },
    { id: 'row-1b-11', code: '1.3.3.2', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.3.2', analysisLevel: 4, displayOrder: 11, values: createEmptyValues() },
    { id: 'row-1b-12', code: '1.3.3.3', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.3.3', analysisLevel: 4, displayOrder: 12, values: createEmptyValues() },
    { id: 'row-1b-13', code: '1.3.4', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.4', analysisLevel: 3, displayOrder: 13, values: createEmptyValues() },
    { id: 'row-1b-14', code: '1.3.4.1', costElementTitle: 'Τίτλος στοιχείου κόστους 1.3.4.1', analysisLevel: 4, displayOrder: 14, values: createEmptyValues() },
  ];

  return {
    sectionId: '1Α',
    sectionTitle: '1Α. Οδοιπορικά Έξοδα Μετασταθμεύσεων',
    analysisLevels,
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

export async function fetchYpodeigma2Section(sectionId: string): Promise<Ypodeigma2SectionConfig> {
  const config = createMockSectionConfig();

  return Promise.resolve({
    ...config,
    sectionId,
    sectionTitle: `${sectionId}. Οδοιπορικά Έξοδα Μετασταθμεύσεων`,
  });
}
