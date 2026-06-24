import { getAmountKey } from './helpers';
import type { Ypodeigma2SectionConfig } from './types';

function createMockSectionConfig(): Ypodeigma2SectionConfig {
  // Το mock ακολουθεί το shape του backend DTO ώστε αργότερα να αντικατασταθεί εύκολα από πραγματικό API call.
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
  ];

  const rows = [
    {
      id: 'row-1',
      code: '1.1',
      costElementTitle: 'Πληρώματα Μοίρας Α/Φ-Ε/Π',
      analysisLevel: 1,
      displayOrder: 1,
      values: {
        [getAmountKey('337m', 'ale-101')]: null,
        [getAmountKey('337m', 'ale-102')]: null,
        [getAmountKey('337m', 'ale-103')]: null,
        [getAmountKey('337m', 'ale-104')]: null,
      },
    },
    {
      id: 'row-2',
      code: '1.2',
      costElementTitle: 'Προσωπικό Συντήρησης',
      analysisLevel: 2,
      displayOrder: 2,
      values: {
        [getAmountKey('337m', 'ale-101')]: 430,
        [getAmountKey('337m', 'ale-102')]: 750,
        [getAmountKey('337m', 'ale-103')]: 260,
        [getAmountKey('337m', 'ale-104')]: null,
      },
    },
    {
      id: 'row-3',
      code: '1.2.1',
      costElementTitle: 'Προσωπικό Συντήρησης D-Level',
      analysisLevel: 3,
      displayOrder: 3,
      values: {
        [getAmountKey('337m', 'ale-101')]: null,
        [getAmountKey('337m', 'ale-102')]: 180,
        [getAmountKey('337m', 'ale-103')]: 360,
        [getAmountKey('337m', 'ale-104')]: 500,
      },
    },
  ];

  return {
    sectionId: '1Α',
    sectionTitle: '1Α. Οδοιπορικά Έξοδα Μετασταθμεύσεων',
    moires,
    rows,
  };
}

export async function fetchYpodeigma2Section(sectionId: string): Promise<Ypodeigma2SectionConfig> {
  // Εδώ θα μπει το πραγματικό call προς το .NET endpoint όταν οριστικοποιηθεί το backend contract.
  const config = createMockSectionConfig();

  return Promise.resolve({
    ...config,
    sectionId,
    sectionTitle: `${sectionId}. Οδοιπορικά Έξοδα Μετασταθμεύσεων`,
  });
}
