export function parseYpodeigma1Amount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const normalizedValue = rawValue.replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

