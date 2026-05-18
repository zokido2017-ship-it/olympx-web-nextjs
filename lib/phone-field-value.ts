/** Normalize RHF + PhoneInput contract: empty string / null → `undefined`. */
export function phoneFieldValueFromForm(
  value: string | undefined | null,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}
