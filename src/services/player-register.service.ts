import { apiClient } from "@/lib/api/client";
import type { RegisterPlayerRequest, RegisterPlayerResponse } from "@/types/api";

export async function registerPlayerProfile(
  payload: RegisterPlayerRequest,
): Promise<RegisterPlayerResponse> {
  const formData = new FormData();
  formData.append("phone_code", payload.phone_code);
  formData.append("mobile_number", payload.mobile_number);
  formData.append("display_name", payload.display_name);

  if (payload.contact_email) {
    formData.append("contact_email", payload.contact_email);
  }
  if (payload.dob) {
    formData.append("dob", payload.dob);
  }
  if (payload.gender) {
    formData.append("gender", payload.gender);
  }
  if (payload.nationality) {
    formData.append("nationality", payload.nationality);
  }
  if (payload.height_cm !== undefined) {
    formData.append("height_cm", String(payload.height_cm));
  }
  if (payload.weight_kg !== undefined) {
    formData.append("weight_kg", String(payload.weight_kg));
  }
  if (payload.connected_app) {
    formData.append("connected_app", payload.connected_app);
  }

  for (const sportId of payload.sportIds) {
    formData.append("ids[]", String(sportId));
  }

  if (payload.photo) {
    formData.append("photo", payload.photo);
  }

  const { data } = await apiClient.post<RegisterPlayerResponse>(
    "/auth/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}
