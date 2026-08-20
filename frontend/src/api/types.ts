export type SubmissionStatus =
  | 'Draft'
  | 'Submitted'
  | 'ReturnedForCorrection'
  | 'Resubmitted';

export type SubmissionSaveAction = 'SaveDraft' | 'Submit';

export type Role = 'SystemDeveloper' | 'SystemAdmin' | 'GlobalReader' | 'StandardUser';

export type CurrentUserDto = {
  userId: number;
  fullName: string;
  epistasia: string;
  orgUnitId: number;
  orgUnitTitle: string;
};

export type AllowedOrgUnitDto = {
  orgUnitId: number;
  canView: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canReturn: boolean;
};

export type AllowedYpodeigmaDto = {
  ypodeigmaId: number;
  title: string;
  responsibleOrgUnits: AllowedOrgUnitDto[];
};

export type AppInitResponseDto = {
  userInfo: CurrentUserDto;
  userRoles: Role[];
  submissionsProsYpovoliCount: number;
  submissionsApoEpistrofiCount: number;
  allowedYpodeigmata: AllowedYpodeigmaDto[];
};

export type MonadaDto = {
  orgUnitId: number;
  onomasia: string;
  moires: MonadaDto[];
};

export type YpodeigmaEntryDto = {
  id: number;
  monadaId: number;
  monadaOnomasia: string;
  moiraId: number | null;
  moiraOnomasia: string | null;
  stoixeioKostousId: number;
  stoixeioKostousOnomasia: string;
  value: number;
  entryComment: string | null;
};

export type YpodeigmaSubmissionResponse = {
  submissionId: number;
  ypodeigmaId: number;
  etosAnaforas: number;
  responsibleOrgUnitId: number;
  responsibleOrgUnitOnomasia: string;
  currentStatus: SubmissionStatus;
  currentRevisionNo: number;
  updatedBy: string;
  updatedAt: string;
  comment: string | null;
  ypodeigmaEntries: YpodeigmaEntryDto[];
};

export type YpodeigmaEntryRequest = {
  monadaOrgUnitId: number;
  moiraOrgUnitId: number | null;
  stoixeioKostousId: number;
  value: number;
  entryComment: string | null;
};

export type YpodeigmaSubmissionRequest = {
  submissionId: number | null;
  ypodeigmaId: number;
  etosAnaforas: number;
  responsibleOrgUnitId: number;
  action: SubmissionSaveAction;
  submissionComment: string | null;
  submissionEventComment: string | null;
  entries: YpodeigmaEntryRequest[];
};

export type YpodeigmaSubmissionRequestResult = {
  submissionId: number;
  submissionRevisionNo: number;
  status: SubmissionStatus;
};

export type ApiProblemDetails = {
  status: number;
  title: string;
  detail: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};
