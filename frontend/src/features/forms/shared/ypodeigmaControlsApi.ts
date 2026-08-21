import { getAppInit } from '../../../api/appApi';
import { canUseAuthenticatedApi } from '../../../api/httpClient';
import { getKatagegrammenaEti, getSubjectOrgUnits } from '../../../api/ypodeigmataApi';
import type { MonadaDto } from '../../../api/types';
import {
  fetchYpodeigmaControlsOptions as fetchMockYpodeigmaControlsOptions,
} from './mockYpodeigmaControlsApi';
import type { OrgUnitOption, YpodeigmaControlsOptions } from './types';

function mapSubjectOrgUnits(monades: MonadaDto[]) {
  const monadaOptions: OrgUnitOption[] = monades.map((monada) => ({
    id: String(monada.orgUnitId),
    name: monada.onomasia,
    type: 'monada',
  }));
  const moiraOptions: OrgUnitOption[] = monades.flatMap((monada) =>
    (monada.moires ?? []).map((moira) => ({
      id: String(moira.orgUnitId),
      name: moira.onomasia,
      type: 'moira' as const,
      parentId: String(monada.orgUnitId),
    })),
  );

  return { monades: monadaOptions, moires: moiraOptions };
}

export async function fetchYpodeigmaControlsOptions(
  ypodeigmaId: number,
): Promise<YpodeigmaControlsOptions> {
  if (!canUseAuthenticatedApi()) {
    return fetchMockYpodeigmaControlsOptions();
  }

  const appInit = await getAppInit();
  const allowedYpodeigma = appInit.allowedYpodeigmata.find(
    (ypodeigma) => ypodeigma.ypodeigmaId === ypodeigmaId,
  );

  if (!allowedYpodeigma || allowedYpodeigma.responsibleOrgUnits.length === 0) {
    throw new Error('Δεν υπάρχουν διαθέσιμες οργανωτικές μονάδες για το συγκεκριμένο Υπόδειγμα.');
  }

  const responsibleOrgUnitIds = allowedYpodeigma.responsibleOrgUnits.map(
    (orgUnit) => orgUnit.orgUnitId,
  );
  const canEdit = allowedYpodeigma.responsibleOrgUnits.some((orgUnit) => orgUnit.canEdit);
  const [years, subjectOrgUnits] = await Promise.all([
    getKatagegrammenaEti(ypodeigmaId, responsibleOrgUnitIds),
    getSubjectOrgUnits(ypodeigmaId, responsibleOrgUnitIds),
  ]);
  const orgUnitOptions = mapSubjectOrgUnits(subjectOrgUnits);

  return {
    ...orgUnitOptions,
    canStartNewYear: canEdit,
    etoi: [...years]
      .sort((left, right) => left - right)
      .map((year) => ({
        value: year,
        label: String(year),
        status: canEdit ? 'editable' : 'view',
      })),
  };
}
