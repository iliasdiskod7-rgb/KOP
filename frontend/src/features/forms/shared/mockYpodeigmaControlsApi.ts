import type { YpodeigmaControlsOptions } from './types';

const MOCK_OPTIONS: YpodeigmaControlsOptions = {
  monades: [
    { id: '110pm', name: '110ΠΜ', type: 'monada' },
    { id: '116pm', name: '116ΠΜ', type: 'monada' },
    { id: '117pm', name: '117ΠΜ', type: 'monada' },
  ],
  moires: [
    { id: '337m-110', name: '337Μ', type: 'moira', parentId: '110pm' },
    { id: '338m-110', name: '338Μ', type: 'moira', parentId: '110pm' },
    { id: '337m-116', name: '337Μ', type: 'moira', parentId: '116pm' },
    { id: '338m-116', name: '338Μ', type: 'moira', parentId: '116pm' },
    { id: '339m-117', name: '339Μ', type: 'moira', parentId: '117pm' },
  ],
  etoi: [
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
  ],
};

export async function fetchYpodeigmaControlsOptions(): Promise<YpodeigmaControlsOptions> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(MOCK_OPTIONS);
    }, 250);
  });
}
