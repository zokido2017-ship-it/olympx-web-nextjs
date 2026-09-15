#!/usr/bin/env node

/**
 * End-to-end API tests for login and registration flows.
 *
 * Usage:
 *   node scripts/test-auth-flows.mjs
 *   TEST_OTP=0000 node scripts/test-auth-flows.mjs
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.sportxo.in/api/v1"
).replace(/\/$/, "");
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || new URL(API_BASE).origin
).replace(/\/$/, "");

const TEST_OTP = process.env.TEST_OTP || "0000";
const phoneSuffix = String(Date.now()).slice(-8);
const newPhone = `9${phoneSuffix}`;

function log(status, name, detail) {
  const extra = detail !== undefined ? ` ${JSON.stringify(detail)}` : "";
  console.log(`[${status}] ${name}${extra}`);
}

async function request(
  path,
  { method = "GET", body, formData, headers: extraHeaders = {}, baseUrl = API_BASE } = {},
) {
  const headers = { Accept: "application/json", ...extraHeaders };
  let payload = body;

  if (formData) {
    payload = formData;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: payload,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: response.ok, status: response.status, data };
}

async function sendOtp(mobileNumber) {
  return request("/auth/send-otp", {
    method: "POST",
    body: { phone_code: "91", mobile_number: mobileNumber },
  });
}

async function validateOtp(mobileNumber) {
  return request("/auth/validate-otp", {
    method: "POST",
    body: { phone_code: "91", mobile_number: mobileNumber, otp: TEST_OTP },
  });
}

async function registerPlayer(mobileNumber) {
  const formData = new FormData();
  formData.append("phone_code", "91");
  formData.append("mobile_number", mobileNumber);
  formData.append("display_name", "Flow Test Player");
  formData.append("contact_email", `flow.${mobileNumber}@example.com`);
  formData.append("dob", "2000-01-01");
  formData.append("gender", "male");
  formData.append("nationality", "IN");
  formData.append("ids[]", "5");

  return request("/auth/register", { method: "POST", formData });
}

async function main() {
  let passed = 0;
  let failed = 0;

  function assert(name, condition, detail) {
    if (condition) {
      passed += 1;
      log("PASS", name, detail);
      return;
    }
    failed += 1;
    log("FAIL", name, detail);
  }

  log("INFO", "api-base", API_BASE);
  log("INFO", "new-phone", newPhone);

  // --- Registration flow (new user) ---
  const signupSend = await sendOtp(newPhone);
  assert("signup-send-otp", signupSend.ok, signupSend.data);
  assert(
    "signup-send-otp-new-user",
    signupSend.data?.registered === false &&
      signupSend.data?.player_exists === false,
    signupSend.data,
  );

  const signupValidate = await validateOtp(newPhone);
  assert("signup-validate-otp", signupValidate.ok, signupValidate.data);
  assert(
    "signup-validate-otp-new-user",
    signupValidate.data?.registered === false,
    signupValidate.data,
  );
  assert(
    "signup-validate-otp-token",
    Boolean(
      signupValidate.data?.token ||
        signupValidate.data?.access_token ||
        signupValidate.data?.auth_code,
    ),
    signupValidate.data,
  );

  const register = await registerPlayer(newPhone);
  assert(
    "signup-register-player",
    register.ok && register.data?.player?.id,
    register.data,
  );

  // --- Login flow (existing user) ---
  const loginSend = await sendOtp(newPhone);
  assert("login-send-otp", loginSend.ok, loginSend.data);
  assert(
    "login-send-otp-existing-user",
    loginSend.data?.registered === true &&
      loginSend.data?.player_exists === true,
    loginSend.data,
  );

  const loginValidate = await validateOtp(newPhone);
  assert("login-validate-otp", loginValidate.ok, loginValidate.data);
  assert(
    "login-validate-otp-existing-user",
    loginValidate.data?.registered === true &&
      loginValidate.data?.player_exists === true,
    loginValidate.data,
  );
  assert(
    "login-validate-otp-token",
    Boolean(
      loginValidate.data?.token ||
        loginValidate.data?.access_token ||
        loginValidate.data?.auth_code,
    ),
    loginValidate.data,
  );

  const authToken =
    loginValidate.data?.token ||
    loginValidate.data?.access_token ||
    loginValidate.data?.auth_code;
  if (authToken) {
    const me = await request("/api/me", {
      baseUrl: API_ORIGIN,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert("authenticated-me", me.ok, me.data);
  }

  const duplicateRegister = await registerPlayer(newPhone);
  assert(
    "register-duplicate-blocked",
    !duplicateRegister.ok || duplicateRegister.status >= 400,
    duplicateRegister.data,
  );

  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
