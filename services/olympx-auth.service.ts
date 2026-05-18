"use client";

import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import type { OlympxPhoneParts } from "@/lib/phone-e164-parts";
import type { OlympxAuthResponse } from "@/lib/olympx/session";
import { resolveOlympxTokenFromApiPayload } from "@/lib/olympx/session";

/**
 * Laravel Olympx API — proxied through Next as `/api/olympx/<path>`.
 * Local Scribe docs: http://127.0.0.1:8000/api-docs#authentication
 *
 * Authentication (JSON):
 * - POST `api/v1/auth/send-otp` — body: `{ phone_code, mobile_number }`
 * - POST `api/v1/auth/validate-otp` — body: `{ phone_code, mobile_number, otp }`
 * - POST `api/v1/auth/register` — body includes `phone_code`, `mobile_number`, `first_name`,
 *   `last_name`, `display_name` (defaults to first + last when omitted), `dob`, `gender`,
 *   `nationality`, `contact_email`; optional `photo_path`, `profile`, `otp` default when omitted.
 */
const PATH_SEND_OTP =
  process.env.NEXT_PUBLIC_OLYMPX_SEND_OTP_PATH ?? "api/v1/auth/send-otp";
const PATH_VALIDATE_OTP =
  process.env.NEXT_PUBLIC_OLYMPX_VERIFY_OTP_PATH ??
  "api/v1/auth/validate-otp";
const PATH_REGISTER =
  process.env.NEXT_PUBLIC_OLYMPX_REGISTER_PATH ?? "api/v1/auth/register";

export class OlympxHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "OlympxHttpError";
    this.status = status;
    this.body = body;
  }
}

export function isOlympxHttpError(e: unknown): e is OlympxHttpError {
  return e instanceof OlympxHttpError;
}

/** Heuristic: send-otp failed because the phone is not registered yet. */
export function sendOtpRequiresRegistration(err: OlympxHttpError): boolean {
  const m = err.message.toLowerCase();
  if (err.status === 404) return true;
  if (
    /not found|no account|register first|does not exist|unknown user|not registered|user not found/.test(
      m,
    )
  ) {
    return true;
  }
  return false;
}

/** Email/phone already used — suggest sign-in. */
export function registerLooksLikeDuplicate(err: OlympxHttpError): boolean {
  const m = err.message.toLowerCase();
  if (err.status === 409) return true;
  if (
    err.status === 422 &&
    /taken|exists|already|registered|duplicate|has already been|phone.*in use|email.*in use|mobile.*in use/.test(
      m,
    )
  ) {
    return true;
  }
  return false;
}

/** When the API echoes the OTP in JSON (common in local/dev), surface it in the UI. */
export function extractOtpHintFromApiPayload(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;

  const tryVal = (v: unknown): string | null => {
    if (typeof v === "string") {
      const t = v.trim();
      if (/^\d{4,8}$/.test(t)) return t;
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      const s = String(Math.trunc(v));
      if (s.length >= 4 && s.length <= 8) return s;
    }
    return null;
  };

  for (const k of [
    "otp",
    "code",
    "verification_code",
    "one_time_password",
    "sms_code",
  ]) {
    const hit = tryVal(o[k]);
    if (hit) return hit;
  }

  const nested = o.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const inner = extractOtpHintFromApiPayload(nested);
    if (inner) return inner;
  }

  const msg = o.message;
  if (typeof msg === "string") {
    const m = msg.match(/\b(\d{4,8})\b/);
    if (m) return m[1];
  }

  return null;
}

function unwrapToken(data: Record<string, unknown>): string | null {
  return resolveOlympxTokenFromApiPayload(data);
}

function errorMessageFromBody(
  data: unknown,
  status: number,
  rawText: string,
): string {
  if (typeof data !== "object" || data === null) {
    return rawText.trim() || `Request failed (${status})`;
  }
  const o = data as Record<string, unknown>;
  const errors = o.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const v of Object.values(errors)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") {
        return v[0];
      }
      if (typeof v === "string") return v;
    }
  }
  if (typeof o.message === "string") return o.message;
  return rawText.trim() || `Request failed (${status})`;
}

function networkErrorMessage(): string {
  return [
    "Could not reach the API from your browser.",
    "Start the Laravel app, set OLYMPEX_API_BASE_URL in .env.local (e.g. http://127.0.0.1:8000), restart Next.js, then try again.",
  ].join(" ");
}

async function postJson(
  path: string,
  body: unknown,
): Promise<Record<string, unknown>> {
  const normalized = path.replace(/^\/+/, "");
  let res: Response;
  try {
    res = await fetch(`/api/olympx/${normalized}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const isFetchFailed =
      raw === "Failed to fetch" ||
      /failed to fetch|networkerror|load failed|network request failed/i.test(
        raw,
      );
    throw new OlympxHttpError(
      isFetchFailed ? networkErrorMessage() : raw,
      0,
      e,
    );
  }

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const msg = errorMessageFromBody(data, res.status, text);
    throw new OlympxHttpError(msg, res.status, data);
  }

  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : {};
}

export async function olympxSendOtp(
  parts: OlympxPhoneParts,
): Promise<Record<string, unknown>> {
  return await postJson(PATH_SEND_OTP, {
    phone_code: parts.phone_code,
    mobile_number: parts.mobile_number,
  });
}

export async function olympxLoginWithOtp(
  parts: OlympxPhoneParts,
  otp: string,
): Promise<OlympxAuthResponse> {
  const raw = await postJson(PATH_VALIDATE_OTP, {
    phone_code: parts.phone_code,
    mobile_number: parts.mobile_number,
    otp,
  });
  authDebug("otp-api", "validate-otp response (top-level keys)", {
    keys: Object.keys(raw),
  });
  const token = unwrapToken(raw);
  if (!token) {
    authDebug("otp-api", "validate-otp: no token in body", {
      hint: "Expected data.token or access_token — inspect Network response",
    });
    throw new OlympxHttpError(
      "Sign-in succeeded but no bearer token was found. Expected `data.token` or `access_token` in the JSON body.",
      200,
      raw,
    );
  }
  authDebug("otp-api", "token received from validate-otp", {
    token: authDebugMaskToken(token),
  });
  return { ...raw, token };
}

/** `POST /api/v1/auth/register` body; `photo_path`, `profile`, `otp` default when omitted. */
export type OlympxRegisterPayload = {
  phone_code: string;
  mobile_number: string;
  first_name: string;
  last_name: string;
  /** Omit to send `first_name` + `last_name` joined; pass explicit string to override. */
  display_name?: string;
  dob: string;
  gender: string;
  nationality: string;
  contact_email: string;
  photo_path?: string;
  profile?: Record<string, unknown>;
  otp?: string;
};

export async function olympxRegister(
  payload: OlympxRegisterPayload,
): Promise<OlympxAuthResponse> {
  const dobRaw = payload.dob.trim();
  const dob =
    dobRaw.length === 10 ? `${dobRaw}T00:00:00.000000Z` : dobRaw;

  const displayName =
    payload.display_name?.trim() ??
    [payload.first_name.trim(), payload.last_name.trim()].filter(Boolean).join(" ");

  const body: Record<string, unknown> = {
    phone_code: String(payload.phone_code).trim(),
    mobile_number: String(payload.mobile_number).trim(),
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    display_name: displayName,
    dob,
    gender: payload.gender.trim(),
    nationality: payload.nationality.trim().toUpperCase(),
    photo_path: (payload.photo_path ?? "").trim(),
    contact_email: payload.contact_email.trim(),
    profile: payload.profile ?? {},
    otp: (payload.otp ?? "").trim(),
  };

  authDebug("otp-api", "register request keys", { keys: Object.keys(body) });

  const raw = await postJson(PATH_REGISTER, body);
  const token = unwrapToken(raw);
  return token ? { ...raw, token } : { ...raw };
}
