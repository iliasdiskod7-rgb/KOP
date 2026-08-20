import { apiGet } from './httpClient';
import type { AppInitResponseDto } from './types';

let appInitPromise: Promise<AppInitResponseDto> | null = null;

export function getAppInit(): Promise<AppInitResponseDto> {
  if (!appInitPromise) {
    appInitPromise = apiGet<AppInitResponseDto>('/api/app/init').catch((error: unknown) => {
      appInitPromise = null;
      throw error;
    });
  }

  return appInitPromise;
}

export function clearAppInitCache() {
  appInitPromise = null;
}
