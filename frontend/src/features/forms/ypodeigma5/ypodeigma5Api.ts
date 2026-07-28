import type { Ypodeigma5SaveRequest } from './types';

export async function saveYpodeigma5Submission(payload: Ypodeigma5SaveRequest) {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  // Εδώ αργότερα θα αντικατασταθεί από πραγματικό POST προς το backend.
  // eslint-disable-next-line no-console
  console.log('Ypodeigma5 save payload', payload);
}
