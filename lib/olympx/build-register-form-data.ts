/**
 * Registration submit payload — always sent as multipart/form-data.
 * Field names match the API contract for profile signup.
 */
import { splitE164ForOlympx } from "@/lib/phone-e164-parts";
import { formatDateOfBirthForOlympxApi } from "@/lib/olympx/format-dob";

export type RegisterMultipartInput = {
  firstName: string;
  lastName: string;
  /** E.164 mobile, e.g. +919876543210 */
  mobile: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  otp: string;
  profileImage?: File | null;
};

export function buildRegisterFormData(input: RegisterMultipartInput): FormData {
  const formData = new FormData();
  const mobileE164 = input.mobile.trim();
  const parts = splitE164ForOlympx(mobileE164);

  formData.append("first_name", input.firstName.trim());
  formData.append("last_name", input.lastName.trim());
  // `mobile` — national number; also send E.164 + parts for backends that split fields.
  formData.append("mobile", parts.mobile_number);
  formData.append("mobile_e164", mobileE164);
  formData.append("phone_code", parts.phone_code);
  formData.append("mobile_number", parts.mobile_number);
  formData.append("email", input.email.trim());
  formData.append("contact_email", input.email.trim());

  const dateOfBirth = formatDateOfBirthForOlympxApi(input.dateOfBirth);
  formData.append("date_of_birth", dateOfBirth);
  // Some Laravel validators use alternate keys.
  formData.append("dob", dateOfBirth);
  formData.append("birth_date", dateOfBirth);

  formData.append("gender", input.gender.trim());
  formData.append("otp", input.otp.trim());

  if (input.profileImage) {
    formData.append("profile_image", input.profileImage, input.profileImage.name);
  }

  return formData;
}
