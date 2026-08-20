import { saveYpodeigmaSubmission } from './ypodeigmataApi';
import type {
  SubmissionSaveAction,
  YpodeigmaSubmissionRequest,
  YpodeigmaSubmissionRequestResult,
} from './types';

type SubmissionIdentity = Pick<
  YpodeigmaSubmissionRequest,
  'ypodeigmaId' | 'etosAnaforas' | 'responsibleOrgUnitId'
>;

type SubmissionWithoutManagedFields = Omit<YpodeigmaSubmissionRequest, 'submissionId' | 'action'>;

function getSubmissionKey(identity: SubmissionIdentity) {
  return `${identity.ypodeigmaId}:${identity.etosAnaforas}:${identity.responsibleOrgUnitId}`;
}

export class SubmissionSession {
  private readonly submissionIds = new Map<string, number>();

  rememberExistingSubmission(submission: SubmissionIdentity & { submissionId: number }) {
    this.submissionIds.set(getSubmissionKey(submission), submission.submissionId);
  }

  getSubmissionId(identity: SubmissionIdentity) {
    return this.submissionIds.get(getSubmissionKey(identity)) ?? null;
  }

  async save(
    request: SubmissionWithoutManagedFields,
    action: SubmissionSaveAction,
  ): Promise<YpodeigmaSubmissionRequestResult> {
    const result = await saveYpodeigmaSubmission(request.ypodeigmaId, {
      ...request,
      submissionId: this.getSubmissionId(request),
      action,
      entries: request.entries.filter((entry) => entry.value > 0),
    });

    this.rememberExistingSubmission({
      ypodeigmaId: request.ypodeigmaId,
      etosAnaforas: request.etosAnaforas,
      responsibleOrgUnitId: request.responsibleOrgUnitId,
      submissionId: result.submissionId,
    });

    return result;
  }

  clear(identity?: SubmissionIdentity) {
    if (identity) {
      this.submissionIds.delete(getSubmissionKey(identity));
      return;
    }

    this.submissionIds.clear();
  }
}

export const submissionSession = new SubmissionSession();
