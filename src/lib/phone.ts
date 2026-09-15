/** Converts a dial code like `+91` to API `phone_code` digits (`91`). */
export function dialCodeToPhoneCode(dialCode: string): string {
  return dialCode.replace(/\D/g, "");
}

/** Normalizes a national number to digits only. */
export function normalizeMobileNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}

export function splitFullName(fullName: string): {
  first_name: string;
  last_name: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { first_name: "", last_name: "" };
  }

  if (parts.length === 1) {
    return { first_name: parts[0], last_name: parts[0] };
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}
