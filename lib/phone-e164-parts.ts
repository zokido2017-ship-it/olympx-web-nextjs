import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Laravel `api/v1/auth/*` expects numeric `phone_code` + `mobile_number`
 * (see API docs: send-otp, validate-otp, register).
 */
export type OlympxPhoneParts = {
  phone_code: string;
  mobile_number: string;
};

export function splitE164ForOlympx(e164: string): OlympxPhoneParts {
  const parsed = parsePhoneNumberFromString(e164.trim());
  if (!parsed) {
    throw new Error("Invalid phone number.");
  }
  return {
    phone_code: String(parsed.countryCallingCode),
    mobile_number: parsed.nationalNumber,
  };
}

export function registrationFieldsFromE164(e164: string): OlympxPhoneParts {
  return splitE164ForOlympx(e164);
}
