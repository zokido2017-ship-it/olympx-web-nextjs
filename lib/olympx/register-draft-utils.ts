import type { OlympxRegisterDraft } from "@/lib/olympx/pending-registration";

const REQUIRED_STRING_FIELDS = [
  "firstName",
  "lastName",
  "contactEmail",
  "dob",
  "phoneE164",
] as const;

/** Returns the first missing field label, or null when complete. */
export function getRegisterDraftMissingField(
  draft: OlympxRegisterDraft | null | undefined,
): string | null {
  if (!draft) return "registration details";

  for (const key of REQUIRED_STRING_FIELDS) {
    const val = draft[key];
    if (typeof val !== "string" || !val.trim()) {
      switch (key) {
        case "firstName":
          return "first name";
        case "lastName":
          return "last name";
        case "contactEmail":
          return "email";
        case "dob":
          return "date of birth";
        case "phoneE164":
          return "mobile number";
        default:
          return key;
      }
    }
  }

  if (!draft.gender?.trim()) return "gender";
  return null;
}

export function isRegisterDraftComplete(
  draft: OlympxRegisterDraft | null | undefined,
): draft is OlympxRegisterDraft {
  return getRegisterDraftMissingField(draft) === null;
}
