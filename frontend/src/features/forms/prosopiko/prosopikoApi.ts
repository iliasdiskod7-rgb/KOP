import type { ProsopikoSaveRequest } from './types';

export async function saveProsopikoSubmission(payload: ProsopikoSaveRequest) {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  // Εδώ αργότερα θα αντικατασταθεί από πραγματικό POST προς το backend.
  // eslint-disable-next-line no-console
  console.log('Prosopiko save payload', payload);
}
