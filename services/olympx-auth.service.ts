"use client";

import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import {
  buildRegisterFormData,
  type RegisterMultipartInput,
} from "@/lib/olympx/build-register-form-data";
import { OLYMPX_REGISTER_API_PATH } from "@/lib/olympx/register-docs";
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
 * - POST `api/v1/auth/register` — multipart/form-data: `first_name`, `last_name`, `mobile`,
 *   `email`, `date_of_birth`, `gender`, `otp`, optional `profile_image`.
 */
const PATH_SEND_OTP =
  process.env.NEXT_PUBLIC_OLYMPX_SEND_OTP_PATH ?? "api/v1/auth/send-otp";
const PATH_VALIDATE_OTP =
  process.env.NEXT_PUBLIC_OLYMPX_VERIFY_OTP_PATH ??
  "api/v1/auth/validate-otp";
const PATH_REGISTER =
  process.env.NEXT_PUBLIC_OLYMPX_REGISTER_PATH ?? OLYMPX_REGISTER_API_PATH;

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

async function postMultipart(
  path: string,
  formData: FormData,
): Promise<Record<string, unknown>> {
  const normalized = path.replace(/^\/+/, "");
  let res: Response;
  try {
    res = await fetch(`/api/olympx/${normalized}`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
      body: formData,
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
    const msg = csrfAwareErrorMessage(res.status, errorMessageFromBody(data, res.status, text));
    throw new OlympxHttpError(msg, res.status, data);
  }

  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : {};
}

function csrfAwareErrorMessage(status: number, msg: string): string {
  if (status !== 419) return msg;
  return [
    msg || "CSRF token mismatch.",
    "Restart Next.js and Laravel, then try again.",
    "Ensure OLYMPEX_API_BASE_URL=http://127.0.0.1:8000 and SANCTUM_STATEFUL_DOMAINS includes localhost:3000.",
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
      credentials: "include",
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
    const msg = csrfAwareErrorMessage(res.status, errorMessageFromBody(data, res.status, text));
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
    hasDataToken:
      typeof (raw as { data?: { token?: unknown } }).data?.token === "string",
    hasRootToken: typeof raw.token === "string",
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
  recordAuthFlowStep("otp-api.token.received", { tokenLength: token.length });
  return { ...raw, token };
}

export type { RegisterMultipartInput as OlympxRegisterInput };

/** `POST /api/v1/auth/register` — always multipart/form-data. */
export async function olympxRegister(
  input: RegisterMultipartInput,
): Promise<OlympxAuthResponse> {
  const formData = buildRegisterFormData(input);

  authDebug("otp-api", "register multipart/form-data", {
    path: PATH_REGISTER,
    fields: [
      "first_name",
      "last_name",
      "mobile",
      "phone_code",
      "mobile_number",
      "email",
      "date_of_birth",
      "dob",
      "gender",
      "otp",
      ...(input.profileImage ? ["profile_image"] : []),
    ],
  });

  const raw = await postMultipart(PATH_REGISTER, formData);
  const token = unwrapToken(raw);
  return token ? { ...raw, token } : { ...raw };
}
