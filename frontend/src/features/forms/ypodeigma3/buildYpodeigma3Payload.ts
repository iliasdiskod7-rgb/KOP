import { getEditableKeysForScope, isLeafRow } from './helpers';
import type {
  Ypodeigma3Config,
  Ypodeigma3Moira,
  Ypodeigma3Row,
  Ypodeigma3SaveRequest,
} from './types';

export function buildYpodeigma3SavePayload(
  config: Ypodeigma3Config,
  rows: Ypodeigma3Row[],
  moires: Ypodeigma3Moira[],
): Ypodeigma3SaveRequest {
  return {
    unitId: config.unit.id,
    rows: rows
      .filter((row) => isLeafRow(row, rows))
      .map((row) => {
        const editableValueKeys = getEditableKeysForScope(row.entryScope, moires);
        const values = Object.fromEntries(
          editableValueKeys.map((valueKey) => [valueKey, row.values[valueKey] ?? null]),
        );

        return {
          rowId: row.id,
          code: row.code,
          entryScope: row.entryScope,
          values,
        };
      }),
  };
}
