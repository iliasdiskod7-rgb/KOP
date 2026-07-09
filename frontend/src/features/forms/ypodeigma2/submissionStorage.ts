import type { Ypodeigma2Submission, Ypodeigma2SubmissionStatus } from './types';

const STORAGE_KEY = 'kop-ypodeigma2-submissions';
const VALID_SUBMISSION_STATUSES = [
  'pending-submission',
  'submitted',
  'returned-for-correction',
] as const;

type LegacySubmissionStatus = 'draft' | 'returned_for_correction';

function isValidSubmissionStatus(value: unknown): value is Ypodeigma2SubmissionStatus {
  return (
    typeof value === 'string' &&
    VALID_SUBMISSION_STATUSES.includes(value as Ypodeigma2SubmissionStatus)
  );
}

function normalizeSubmissionStatus(value: unknown): Ypodeigma2SubmissionStatus | null {
  if (isValidSubmissionStatus(value)) {
    return value;
  }

  if (value === undefined) {
    return 'pending-submission';
  }

  if (value === 'draft') {
    return 'pending-submission';
  }

  if (value === 'returned_for_correction') {
    return 'returned-for-correction';
  }

  return null;
}

function toSubmissionRecord(value: unknown): Ypodeigma2Submission | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown> & { status?: LegacySubmissionStatus };
  const normalizedStatus = normalizeSubmissionStatus(candidate.status);

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.sectionId !== 'string' ||
    typeof candidate.sectionTitle !== 'string' ||
    typeof candidate.totalAmount !== 'number' ||
    typeof candidate.moiraCount !== 'number' ||
    typeof candidate.rowCount !== 'number' ||
    normalizedStatus === null
  ) {
    return null;
  }

  return {
    id: candidate.id,
    createdAt: candidate.createdAt,
    ypodeigmaLabel:
      typeof candidate.ypodeigmaLabel === 'string' ? candidate.ypodeigmaLabel : 'Υπόδειγμα 2',
    pterygaLabel: typeof candidate.pterygaLabel === 'string' ? candidate.pterygaLabel : null,
    etos: typeof candidate.etos === 'number' ? candidate.etos : null,
    sectionId: candidate.sectionId,
    sectionTitle: candidate.sectionTitle,
    totalAmount: candidate.totalAmount,
    moiraCount: candidate.moiraCount,
    rowCount: candidate.rowCount,
    status: normalizedStatus,
  };
}

export function getStoredYpodeigma2Submissions(): Ypodeigma2Submission[] {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.reduce<Ypodeigma2Submission[]>((submissions, entry) => {
      const submission = toSubmissionRecord(entry);

      if (submission) {
        submissions.push(submission);
      }

      return submissions;
    }, []);
  } catch {
    return [];
  }
}

export function saveYpodeigma2Submission(submission: Ypodeigma2Submission) {
  const currentSubmissions = getStoredYpodeigma2Submissions();
  const nextSubmissions = [submission, ...currentSubmissions];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubmissions));
}

export function upsertYpodeigma2Submission(submission: Ypodeigma2Submission) {
  const currentSubmissions = getStoredYpodeigma2Submissions();
  const filteredSubmissions = currentSubmissions.filter((entry) => entry.id !== submission.id);
  const nextSubmissions = [submission, ...filteredSubmissions];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubmissions));
}
