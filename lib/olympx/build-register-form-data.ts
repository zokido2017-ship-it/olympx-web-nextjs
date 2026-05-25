/**
 * Registration submit payload — always sent as multipart/form-data.
 * Field names match the API contract for profile signup.
 */
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

  formData.append("first_name", input.firstName.trim());
  formData.append("last_name", input.lastName.trim());
  formData.append("mobile", input.mobile.trim());
  formData.append("email", input.email.trim());
  formData.append("date_of_birth", input.dateOfBirth.trim());
  formData.append("gender", input.gender.trim());
  formData.append("otp", input.otp.trim());

  if (input.profileImage) {
    formData.append("profile_image", input.profileImage, input.profileImage.name);
  }

  return formData;
}
