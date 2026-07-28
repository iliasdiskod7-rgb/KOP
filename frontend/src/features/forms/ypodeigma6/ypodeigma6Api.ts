import type { Ypodeigma6SaveRequest } from './types';

export async function saveYpodeigma6Submission(payload: Ypodeigma6SaveRequest) {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  // Εδώ αργότερα θα αντικατασταθεί από πραγματικό POST προς το backend.
  // eslint-disable-next-line no-console
  console.log('Ypodeigma6 save payload', payload);
}
