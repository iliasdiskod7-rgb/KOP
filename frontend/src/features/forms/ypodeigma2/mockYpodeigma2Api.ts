import { getAmountKey } from './helpers';
import type { Ypodeigma2SectionConfig } from './types';

function createMockSectionConfig(): Ypodeigma2SectionConfig {
  // Προσωρινό mock με το shape που αναμένουμε να επιστρέφει αργότερα το backend.
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
      values: {
        [getAmountKey('337m', 'ale-101')]: null,
        [getAmountKey('337m', 'ale-102')]: null,
        [getAmountKey('337m', 'ale-103')]: null,
        [getAmountKey('337m', 'ale-104')]: null,
        [getAmountKey('338m', 'ale-201')]: null,
        [getAmountKey('338m', 'ale-202')]: null,
        [getAmountKey('338m', 'ale-203')]: null,
        [getAmountKey('338m', 'ale-204')]: null,
      },
    },
    {
      id: 'row-1a-2',
      code: '1.2',
      costElementTitle: 'Προσωπικό Συντήρησης',
      analysisLevel: 2,
      displayOrder: 2,
      values: {
        [getAmountKey('337m', 'ale-101')]: 430,
        [getAmountKey('337m', 'ale-102')]: 750,
        [getAmountKey('337m', 'ale-103')]: 260,
        [getAmountKey('337m', 'ale-104')]: null,
        [getAmountKey('338m', 'ale-201')]: 120,
        [getAmountKey('338m', 'ale-202')]: null,
        [getAmountKey('338m', 'ale-203')]: 300,
        [getAmountKey('338m', 'ale-204')]: 90,
      },
    },
    {
      id: 'row-1a-3',
      code: '1.2.1',
      costElementTitle: 'Προσωπικό Συντήρησης D-Level',
      analysisLevel: 3,
      displayOrder: 3,
      values: {
        [getAmountKey('337m', 'ale-101')]: null,
        [getAmountKey('337m', 'ale-102')]: 180,
        [getAmountKey('337m', 'ale-103')]: 360,
        [getAmountKey('337m', 'ale-104')]: 500,
        [getAmountKey('338m', 'ale-201')]: null,
        [getAmountKey('338m', 'ale-202')]: 50,
        [getAmountKey('338m', 'ale-203')]: 80,
        [getAmountKey('338m', 'ale-204')]: 40,
      },
    },
  ];

  const section1BRows = [
    {
      id: 'row-1b-1',
      code: '1.Β.1',
      costElementTitle: 'Έξοδα διαμονής προσωπικού',
      analysisLevel: 2,
      displayOrder: 1,
      values: {
        [getAmountKey('337m', 'ale-101')]: 210,
        [getAmountKey('337m', 'ale-102')]: 120,
        [getAmountKey('337m', 'ale-103')]: null,
        [getAmountKey('337m', 'ale-104')]: 80,
        [getAmountKey('338m', 'ale-201')]: 95,
        [getAmountKey('338m', 'ale-202')]: 70,
        [getAmountKey('338m', 'ale-203')]: null,
        [getAmountKey('338m', 'ale-204')]: 40,
      },
    },
    {
      id: 'row-1b-2',
      code: '1.Β.2',
      costElementTitle: 'Έξοδα ημερήσιας αποζημίωσης',
      analysisLevel: 3,
      displayOrder: 2,
      values: {
        [getAmountKey('337m', 'ale-101')]: 150,
        [getAmountKey('337m', 'ale-102')]: 180,
        [getAmountKey('337m', 'ale-103')]: 110,
        [getAmountKey('337m', 'ale-104')]: 90,
        [getAmountKey('338m', 'ale-201')]: 130,
        [getAmountKey('338m', 'ale-202')]: 75,
        [getAmountKey('338m', 'ale-203')]: 65,
        [getAmountKey('338m', 'ale-204')]: 30,
      },
    },
    {
      id: 'row-1b-3',
      code: '1.Β.3',
      costElementTitle: 'Λοιπά έξοδα μετακίνησης',
      analysisLevel: 4,
      displayOrder: 3,
      values: {
        [getAmountKey('337m', 'ale-101')]: null,
        [getAmountKey('337m', 'ale-102')]: 40,
        [getAmountKey('337m', 'ale-103')]: 55,
        [getAmountKey('337m', 'ale-104')]: 25,
        [getAmountKey('338m', 'ale-201')]: null,
        [getAmountKey('338m', 'ale-202')]: 20,
        [getAmountKey('338m', 'ale-203')]: 35,
        [getAmountKey('338m', 'ale-204')]: 15,
      },
    },
  ];

  return {
    sectionId: '1Α',
    sectionTitle: '1Α. Οδοιπορικα Εξοδα Μετασταθμευσεων',
    analysisLevels,
    moires,
    rows: section1ARows,
    section1B: {
      sectionId: '1Β',
      sectionTitle: '1Β. Οδοιπορικά Έξοδα Μετακινήσεων Λοιπών Μοιρών-Επιστασιών-Τμημάτων Άμεσης Υποστήριξης Πτητικού Έργου',
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
