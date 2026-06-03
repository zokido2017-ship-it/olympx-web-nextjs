/**
 * Laravel register endpoints typically expect `date_of_birth` as Y-m-d (e.g. 2001-05-15).
 * HTML `<input type="date">` already returns that format — keep it stable for the API.
 */
export function formatDateOfBirthForOlympxApi(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // HTML date input / ISO date
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // d/m/Y or d-m-Y
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback parse — use UTC parts to avoid timezone shifting calendar dates
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return trimmed;
}

export function isValidOlympxDateOfBirth(raw: string): boolean {
  const formatted = formatDateOfBirthForOlympxApi(raw);
  if (!formatted || !/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return false;
  const [y, m, d] = formatted.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}
