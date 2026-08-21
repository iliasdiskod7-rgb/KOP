import { getAppInit } from '../../../api/appApi';
import { canUseAuthenticatedApi } from '../../../api/httpClient';
import { submissionSession } from '../../../api/submissionSession';
import { getStoixeiaKostous, getYpodeigmaEntries } from '../../../api/ypodeigmataApi';
import type {
  StoixeioKostousDto,
  SubmissionSaveAction,
  SubmissionStatus,
  YpodeigmaEntryDto,
  YpodeigmaSubmissionResponse,
  YpodeigmaSubmissionRequestResult,
} from '../../../api/types';
import { fetchYpodeigma1ForMoira as fetchMockYpodeigma1ForMoira } from './mockYpodeigma1Api';
import type {
  FetchYpodeigma1ForMoiraParams,
  Ypodeigma1MoiraCacheEntry,
  Ypodeigma1MoiraData,
  Ypodeigma1TableARow,
  Ypodeigma1TableBRow,
  Ypodeigma1TableCRow,
} from './types';
import { isLeafRow } from './helpers';

const YPODEIGMA_ID = 1;

// Οι κωδικοί είναι επιχειρησιακά όρια των πινάκων, όχι αντιστοίχιση βάσει σειράς.
const TABLE_1A_BRANCH_CODES = ['1.1', '1.2.1'];
const TABLE_1B_BRANCH_CODES = ['1.2.2', '1.3.1'];
const TABLE_1C_BRANCH_CODES = ['1.3.2'];

function parseBackendId(value: string, fieldLabel: string) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Το ${fieldLabel} δεν έχει έγκυρο backend id.`);
  }

  return parsedValue;
}

function belongsToBranch(code: string, branchCode: string) {
  return (
    code === branchCode ||
    code.startsWith(`${branchCode}.`) ||
    branchCode.startsWith(`${code}.`)
  );
}

function selectSectionRows(schema: StoixeioKostousDto[], branchCodes: string[]) {
  return schema.filter((item) =>
    branchCodes.some((branchCode) => belongsToBranch(item.kodikos, branchCode)),
  );
}

function buildAmountMap(entries: YpodeigmaEntryDto[]) {
  const amounts = new Map<number, number>();

  entries.forEach((entry) => {
    amounts.set(entry.stoixeioKostousId, entry.value);
  });

  return amounts;
}

function mapSchemaRow(item: StoixeioKostousDto, amounts: Map<number, number>) {
  return {
    id: String(item.id),
    stoixeioKostousId: item.id,
    code: item.kodikos,
    title: item.onomasia,
    amount: amounts.get(item.id) ?? null,
    analysisLevel: item.epipedoAnalysis,
  };
}

function isEditableStatus(status: SubmissionStatus) {
  return status === 'Draft' || status === 'ReturnedForCorrection';
}

function findRelevantSubmission(
  submissions: YpodeigmaSubmissionResponse[],
  monadaId: number,
  moiraId: number,
) {
  return submissions.find(
    (submission) =>
      submission.responsibleOrgUnitId === monadaId ||
      submission.ypodeigmaEntries.some(
        (entry) => entry.monadaId === monadaId && (entry.moiraId === null || entry.moiraId === moiraId),
      ),
  );
}

function resolveResponsibleOrgUnitId(
  allowedResponsibleOrgUnitIds: number[],
  monadaId: number,
  relevantSubmission: YpodeigmaSubmissionResponse | undefined,
) {
  if (relevantSubmission) {
    return relevantSubmission.responsibleOrgUnitId;
  }

  if (allowedResponsibleOrgUnitIds.includes(monadaId)) {
    return monadaId;
  }

  if (allowedResponsibleOrgUnitIds.length === 1) {
    return allowedResponsibleOrgUnitIds[0];
  }

  throw new Error(
    'Δεν μπορεί να προσδιοριστεί με ασφάλεια η υπεύθυνη οργανωτική μονάδα για την αποθήκευση.',
  );
}

export async function fetchYpodeigma1ForMoira(
  params: FetchYpodeigma1ForMoiraParams,
): Promise<Ypodeigma1MoiraData> {
  if (!canUseAuthenticatedApi()) {
    return fetchMockYpodeigma1ForMoira(params);
  }

  const monadaId = parseBackendId(params.monadaId, 'id της Μονάδας');
  const moiraId = parseBackendId(params.moiraId, 'id της Μοίρας');
  const appInit = await getAppInit();
  const allowedYpodeigma = appInit.allowedYpodeigmata.find(
    (ypodeigma) => ypodeigma.ypodeigmaId === YPODEIGMA_ID,
  );
  const responsibleOrgUnitIds =
    allowedYpodeigma?.responsibleOrgUnits.map((orgUnit) => orgUnit.orgUnitId) ?? [];

  if (responsibleOrgUnitIds.length === 0) {
    throw new Error('Δεν υπάρχουν διαθέσιμες υπεύθυνες οργανωτικές μονάδες για το Υπόδειγμα 1.');
  }

  const [schema, submissions] = await Promise.all([
    getStoixeiaKostous(YPODEIGMA_ID),
    params.etosSource === 'existing' && params.etos
      ? getYpodeigmaEntries(YPODEIGMA_ID, params.etos, responsibleOrgUnitIds)
      : Promise.resolve<YpodeigmaSubmissionResponse[]>([]),
  ]);
  const relevantSubmission = findRelevantSubmission(submissions, monadaId, moiraId);
  const responsibleOrgUnitId = resolveResponsibleOrgUnitId(
    responsibleOrgUnitIds,
    monadaId,
    relevantSubmission,
  );

  if (relevantSubmission) {
    submissionSession.rememberExistingSubmission({
      ypodeigmaId: YPODEIGMA_ID,
      etosAnaforas: relevantSubmission.etosAnaforas,
      responsibleOrgUnitId,
      submissionId: relevantSubmission.submissionId,
    });
  }

  const allEntries = relevantSubmission?.ypodeigmaEntries ?? [];
  const moiraAmounts = buildAmountMap(
    allEntries.filter((entry) => entry.monadaId === monadaId && entry.moiraId === moiraId),
  );
  const monadaAmounts = buildAmountMap(
    allEntries.filter((entry) => entry.monadaId === monadaId && entry.moiraId === null),
  );
  const status =
    params.etosSource === 'new'
      ? 'editable'
      : relevantSubmission
        ? isEditableStatus(relevantSubmission.currentStatus) && params.etosStatus !== 'view'
          ? 'editable'
          : 'view'
        : (params.etosStatus ?? 'editable');

  return {
    responsibleOrgUnitId,
    monadaId: params.monadaId,
    monadaLabel: params.monadaLabel ?? params.monadaId,
    moiraId: params.moiraId,
    moiraLabel: params.moiraLabel ?? params.moiraId,
    etos: params.etos,
    status,
    table1ARows: selectSectionRows(schema, TABLE_1A_BRANCH_CODES).map(
      (item): Ypodeigma1TableARow => mapSchemaRow(item, moiraAmounts),
    ),
    table1BRows: selectSectionRows(schema, TABLE_1B_BRANCH_CODES).map(
      (item): Ypodeigma1TableBRow => mapSchemaRow(item, monadaAmounts),
    ),
    table1CRows: selectSectionRows(schema, TABLE_1C_BRANCH_CODES).map(
      (item): Ypodeigma1TableCRow => mapSchemaRow(item, monadaAmounts),
    ),
  };
}

function buildBackendEntries(entry: Ypodeigma1MoiraCacheEntry) {
  const monadaId = parseBackendId(entry.monadaId, 'id της Μονάδας');
  const moiraId = parseBackendId(entry.moiraId, 'id της Μοίρας');
  const sections = [
    { rows: entry.table1ARows, moiraOrgUnitId: moiraId },
    { rows: entry.table1BRows, moiraOrgUnitId: null },
    { rows: entry.table1CRows, moiraOrgUnitId: null },
  ];

  const entries = sections.flatMap(({ rows, moiraOrgUnitId }) =>
    rows
      .filter((row) => isLeafRow(row, rows))
      .filter((row) => row.amount !== null)
      .map((row) => {
        if (!row.stoixeioKostousId) {
          throw new Error(`Δεν υπάρχει backend id για το στοιχείο κόστους ${row.code}.`);
        }

        if (row.amount === null || row.amount <= 0) {
          throw new Error(`Η τιμή του στοιχείου κόστους ${row.code} πρέπει να είναι μεγαλύτερη από μηδέν.`);
        }

        return {
          monadaOrgUnitId: monadaId,
          moiraOrgUnitId,
          stoixeioKostousId: row.stoixeioKostousId,
          value: row.amount,
          entryComment: null,
        };
      }),
  );

  if (entries.length === 0) {
    throw new Error('Συμπληρώστε τουλάχιστον ένα ποσό πριν από την αποθήκευση.');
  }

  return entries;
}

export async function saveYpodeigma1Submission(
  entry: Ypodeigma1MoiraCacheEntry,
  action: SubmissionSaveAction,
): Promise<YpodeigmaSubmissionRequestResult> {
  if (!entry.etos || !entry.responsibleOrgUnitId) {
    throw new Error('Δεν υπάρχουν όλα τα απαραίτητα στοιχεία για την αποθήκευση.');
  }

  return submissionSession.save(
    {
      ypodeigmaId: YPODEIGMA_ID,
      etosAnaforas: entry.etos,
      responsibleOrgUnitId: entry.responsibleOrgUnitId,
      submissionComment: null,
      submissionEventComment: null,
      entries: buildBackendEntries(entry),
    },
    action,
  );
}
