import type { Ypodeigma4SaveRequest } from './types';

export async function saveYpodeigma4Submission(payload: Ypodeigma4SaveRequest) {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  // Εδώ αργότερα θα γίνει πραγματικό POST προς backend.
  // eslint-disable-next-line no-console
  console.log('Ypodeigma4 save payload', payload);
}
