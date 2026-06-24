export type Ypodeigma2Identifier = string | number;

export type Ypodeigma2AmountMap = Record<string, number | null>;

export type Ypodeigma2SectionConfig = {
  sectionId: string;
  sectionTitle: string;
  moires: Ypodeigma2Moira[];
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
