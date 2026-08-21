import { apiGet, apiPost } from './httpClient';
import type {
  MonadaDto,
  StoixeioKostousDto,
  YpodeigmaSubmissionRequest,
  YpodeigmaSubmissionRequestResult,
  YpodeigmaSubmissionResponse,
} from './types';

export function getStoixeiaKostous(ypodeigmaId: number): Promise<StoixeioKostousDto[]> {
  return apiGet<StoixeioKostousDto[]>(`/api/ypodeigma/${ypodeigmaId}/stoixeiaKostous`);
}

function buildResponsibleOrgUnitQuery(responsibleOrgUnitIds: number[]) {
  const searchParams = new URLSearchParams();

  responsibleOrgUnitIds.forEach((orgUnitId) => {
    searchParams.append('responsibleOrgUnitIds', String(orgUnitId));
  });

  return searchParams;
}

export function getKatagegrammenaEti(
  ypodeigmaId: number,
  responsibleOrgUnitIds: number[],
): Promise<number[]> {
  const searchParams = buildResponsibleOrgUnitQuery(responsibleOrgUnitIds);
  return apiGet<number[]>(`/api/ypodeigma/${ypodeigmaId}/katagegrammenaEti?${searchParams}`);
}

export function getSubjectOrgUnits(
  ypodeigmaId: number,
  responsibleOrgUnitIds: number[],
): Promise<MonadaDto[]> {
  const searchParams = buildResponsibleOrgUnitQuery(responsibleOrgUnitIds);
  return apiGet<MonadaDto[]>(`/api/ypodeigma/${ypodeigmaId}/subjectOrgUnits?${searchParams}`);
}

export function getYpodeigmaEntries(
  ypodeigmaId: number,
  etosAnaforas: number,
  responsibleOrgUnitIds: number[],
): Promise<YpodeigmaSubmissionResponse[]> {
  const searchParams = buildResponsibleOrgUnitQuery(responsibleOrgUnitIds);
  searchParams.set('etosAnaforas', String(etosAnaforas));
  return apiGet<YpodeigmaSubmissionResponse[]>(
    `/api/ypodeigma/${ypodeigmaId}/entries?${searchParams}`,
  );
}

export function saveYpodeigmaSubmission(
  ypodeigmaId: number,
  request: YpodeigmaSubmissionRequest,
): Promise<YpodeigmaSubmissionRequestResult> {
  if (request.ypodeigmaId !== ypodeigmaId) {
    throw new Error('Το ypodeigmaId του route πρέπει να είναι ίδιο με το ypodeigmaId του request.');
  }

  if (request.entries.some((entry) => entry.value <= 0)) {
    throw new Error('Οι τιμές που αποστέλλονται στο backend πρέπει να είναι μεγαλύτερες από μηδέν.');
  }

  return apiPost<YpodeigmaSubmissionRequestResult, YpodeigmaSubmissionRequest>(
    `/api/ypodeigma/${ypodeigmaId}/save`,
    request,
  );
}
