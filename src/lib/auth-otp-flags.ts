import type { SendOtpResponse } from "@/types/api";

export type PhoneOtpFlags = {
  registered: boolean;
  playerExists: boolean;
};

/** Normalizes send-otp response flags (`player_exists` / `player_exist`). */
export function parseSendOtpFlags(
  response: SendOtpResponse,
): PhoneOtpFlags {
  const registered = Boolean(response.registered);
  const playerExists = Boolean(
    response.player_exists ?? response.player_exist ?? registered,
  );

  return { registered, playerExists };
}
