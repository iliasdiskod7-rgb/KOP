export type Ypodeigma2Identifier = string | number;

export type Ypodeigma2AmountMap = Record<string, number | null>;

export type Ypodeigma2AnalysisLevel = {
  id: Ypodeigma2Identifier;
  value: number;
  label: string;
  displayOrder: number;
};

export type Ypodeigma2SectionConfig = {
  sectionId: string;
  sectionTitle: string;
  status: 'editable' | 'view';
  analysisLevels: Ypodeigma2AnalysisLevel[];
  moires: Ypodeigma2Moira[];
  rows: Ypodeigma2Row[];
  section1B: Ypodeigma2ChildSectionConfig;
};

export type Ypodeigma2ChildSectionConfig = {
  sectionId: string;
  sectionTitle: string;
  rows: Ypodeigma2Row[];
};

export type Ypodeigma2Moira = {
  id: Ypodeigma2Identifier;
  label: string;
  displayOrder: number;
  ales: Ypodeigma2Ale[];
};

export type Ypodeigma2Ale = {
  id: Ypodeigma2Identifier;
  code: string;
  label: string;
  displayOrder: number;
};

export type Ypodeigma2Row = {
  id: Ypodeigma2Identifier;
  code: string;
  costElementTitle: string;
  analysisLevel: number;
  displayOrder: number;
  values: Ypodeigma2AmountMap;
};

export type Ypodeigma2SubmissionStatus =
  | 'pending-submission'
  | 'submitted'
  | 'returned-for-correction';

export type Ypodeigma2Submission = {
  id: string;
  createdAt: string;
  ypodeigmaLabel: string;
  pterygaLabel: string | null;
  etos: number | null;
  sectionId: string;
  sectionTitle: string;
  totalAmount: number;
  moiraCount: number;
  rowCount: number;
  status: Ypodeigma2SubmissionStatus;
};
