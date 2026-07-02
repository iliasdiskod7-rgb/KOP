import type { Ypodeigma3SaveRequest, Ypodeigma3SaveResponse } from './types';

export async function saveYpodeigma3Submission(
  payload: Ypodeigma3SaveRequest,
): Promise<Ypodeigma3SaveResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  // Εδώ αργότερα θα γίνει πραγματικό POST προς backend.
  // eslint-disable-next-line no-console
  console.log('Ypodeigma3 save payload', payload);

  return {
    submissionId: crypto.randomUUID(),
    status: 'saved',
  };
}
