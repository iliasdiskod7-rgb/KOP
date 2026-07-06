import type { Ypodeigma1CacheByMoira, Ypodeigma1SavePayload } from './types';

type BuildYpodeigma1SavePayloadParams = {
  monadaId: string | null;
  etos: number | null;
  cacheByMoira: Ypodeigma1CacheByMoira;
};

export function buildYpodeigma1SavePayload({
  monadaId,
  etos,
  cacheByMoira,
}: BuildYpodeigma1SavePayloadParams): Ypodeigma1SavePayload {
  return {
    monadaId,
    etos,
    moires: Object.values(cacheByMoira)
      .filter((entry) => (monadaId ? entry.monadaId === monadaId : true))
      .map((entry) => ({
        moiraId: entry.moiraId,
        monadaId: entry.monadaId,
        tableARows: entry.tableARows,
        tableBRows: entry.tableBRows,
      })),
  };
}
