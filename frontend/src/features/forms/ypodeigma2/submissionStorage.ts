import type { Ypodeigma2Submission } from './types';

const STORAGE_KEY = 'kop-ypodeigma2-submissions';

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

    return parsedValue.filter(isSubmissionRecord);
  } catch {
    return [];
  }
}

export function saveYpodeigma2Submission(submission: Ypodeigma2Submission) {
  const currentSubmissions = getStoredYpodeigma2Submissions();
  const nextSubmissions = [submission, ...currentSubmissions];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubmissions));
}

function isSubmissionRecord(value: unknown): value is Ypodeigma2Submission {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.sectionId === 'string' &&
    typeof candidate.sectionTitle === 'string' &&
    typeof candidate.totalAmount === 'number' &&
    typeof candidate.moiraCount === 'number' &&
    typeof candidate.rowCount === 'number'
  );
}
