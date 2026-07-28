export type Ypodeigma4Unit = {
  id: string;
  name: string;
};

export type Ypodeigma4Moira = {
  id: string;
  label: string;
  displayOrder: number;
};

export type Ypodeigma4MetricType = 'diatetheises-eo' | 'pososto-diathesis-p2';

export type Ypodeigma4Row = {
  id: string;
  label: string;
  metricType: Ypodeigma4MetricType;
  displayOrder: number;
  values: Record<string, number | null>;
};

export type Ypodeigma4Config = {
  wing: Ypodeigma4Unit;
  unit: Ypodeigma4Unit;
  status: 'editable' | 'view';
  moires: Ypodeigma4Moira[];
  rows: Ypodeigma4Row[];
};

export type Ypodeigma4SaveRequest = {
  wingId: string;
  etos: number;
  rows: Array<{
    rowId: string;
    metricType: Ypodeigma4MetricType;
    values: Record<string, number | null>;
  }>;
};

export type Ypodeigma4FormActions = {
  saveDraft: () => Promise<void>;
  submitFinal: () => Promise<void>;
};
