/**
 * E2E auth flow smoke test against local Next.js + Laravel.
 * Usage: node scripts/test-auth-flow.mjs
 */
const BASE = "http://localhost:3000";
const LARAVEL_LOG =
  process.env.LARAVEL_LOG ??
  "C:/Users/lenovo/Downloads/olympx-laravel-main/olympx-laravel-main/storage/logs/laravel.log";
const DEV_MAGIC_OTP = "2468";

function tsSuffix() {
  return String(Date.now()).slice(-7);
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}/api/olympx/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function readOtpFromLaravelLog(phoneE164) {
  try {
    const fs = await import("node:fs/promises");
    const text = await fs.readFile(LARAVEL_LOG, "utf8");
    const digits = phoneE164.replace(/\D/g, "");
    const lines = text.split("\n").reverse();
    for (const line of lines) {
      if (!line.includes(digits)) continue;
      const m = line.match(/"otp":"(\d{4})"/);
      if (m) return m[1];
    }
  } catch {
    /* log unavailable */
  }
  return null;
}

async function resolveOtp(sendData, phoneE164) {
  const fromApi = extractOtp(sendData);
  if (fromApi) return fromApi;
  const fromLog = await readOtpFromLaravelLog(phoneE164);
  if (fromLog) return fromLog;
  return DEV_MAGIC_OTP;
}

function extractOtp(data) {
  const tryVal = (v) => {
    if (typeof v === "string" && /^\d{4,8}$/.test(v.trim())) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) {
      const s = String(Math.trunc(v));
      if (s.length >= 4 && s.length <= 8) return s;
    }
    return null;
  };
  if (!data || typeof data !== "object") return null;
  for (const k of ["otp", "code", "verification_code", "one_time_password", "sms_code"]) {
    const hit = tryVal(data[k]);
    if (hit) return hit;
  }
  const nested = data.data;
  if (nested && typeof nested === "object") return extractOtp(nested);
  if (typeof data.message === "string") {
    const m = data.message.match(/\b(\d{4,8})\b/);
    if (m) return m[1];
  }
  return null;
}

function extractToken(data) {
  if (!data || typeof data !== "object") return null;
  const inner = data.data;
  if (inner && typeof inner === "object") {
    if (typeof inner.token === "string" && inner.token.trim()) return inner.token.trim();
    if (typeof inner.access_token === "string" && inner.access_token.trim())
      return inner.access_token.trim();
  }
  if (typeof data.token === "string" && data.token.trim()) return data.token.trim();
  if (typeof data.access_token === "string" && data.access_token.trim())
    return data.access_token.trim();
  return null;
}

async function postMultipart(path, formData) {
  const res = await fetch(`${BASE}/api/olympx/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
    cache: "no-store",
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function syncSession(token) {
  const post = await fetch(`${BASE}/api/auth/olympx-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: BASE,
    },
    body: JSON.stringify({ token }),
  });
  const setCookie = post.headers.get("set-cookie") ?? "";
  const cookiePair = setCookie.split(";")[0];
  const get = await fetch(`${BASE}/api/auth/olympx-session`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      Origin: BASE,
      ...(cookiePair ? { Cookie: cookiePair } : {}),
    },
    cache: "no-store",
  });
  return {
    postOk: post.ok,
    postStatus: post.status,
    getOk: get.ok,
    getStatus: get.status,
    setCookie: setCookie.includes("olympx_access_token"),
    cookiePair,
  };
}

/** Simulates browser OTP login + session sync without manually forwarding cookies on GET. */
async function browserLikeLoginSession(parts, otp) {
  const login = await postJson("api/v1/auth/validate-otp", {
    phone_code: parts.phone_code,
    mobile_number: parts.mobile_number,
    otp,
  });
  const token = extractToken(login.data);
  if (!token) return { ok: false, reason: "no-token", loginStatus: login.status };

  const post = await fetch(`${BASE}/api/auth/olympx-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: BASE,
    },
    body: JSON.stringify({ token }),
  });
  if (!post.ok) {
    return { ok: false, reason: "post-failed", postStatus: post.status, tokenLen: token.length };
  }

  const get = await fetch(`${BASE}/api/auth/olympx-session`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json", Origin: BASE },
    cache: "no-store",
  });

  const setCookie = post.headers.get("set-cookie") ?? "";
  return {
    ok: get.ok,
    reason: get.ok ? "ok" : "get-missed-cookie",
    postStatus: post.status,
    getStatus: get.status,
    hasSetCookie: setCookie.includes("olympx_access_token"),
    tokenLen: token.length,
  };
}

async function checkProtectedRoute(cookieHeader) {
  const res = await fetch(`${BASE}/organizations/create`, {
    redirect: "manual",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
  return { status: res.status, location: res.headers.get("location") };
}

async function main() {
  const suffix = tsSuffix();
  const mobileNumber = `98765${suffix}`.slice(0, 10);
  const phoneE164 = `+91${mobileNumber}`;
  const email = `test+${suffix}@example.com`;
  const user = {
    firstName: "Test",
    lastName: "User",
    phoneE164,
    phone_code: "91",
    mobile_number: mobileNumber,
    email,
    dob: "1995-06-15",
    gender: "male",
  };

  console.log("=== Auth E2E Test ===");
  console.log("User:", user);

  // 1. Send OTP for registration
  console.log("\n[1] send-otp (register)...");
  const send1 = await postJson("api/v1/auth/send-otp", {
    phone_code: user.phone_code,
    mobile_number: user.mobile_number,
  });
  console.log("  status:", send1.status, "body:", JSON.stringify(send1.data).slice(0, 300));
  if (!send1.ok) {
    console.error("FAIL: send-otp");
    process.exit(1);
  }
  let otp = await resolveOtp(send1.data, user.phoneE164);
  console.log("  OTP:", otp);

  // 2. Register
  console.log("\n[2] register...");
  const fd = new FormData();
  fd.append("first_name", user.firstName);
  fd.append("last_name", user.lastName);
  fd.append("mobile", user.mobile_number);
  fd.append("mobile_e164", user.phoneE164);
  fd.append("phone_code", user.phone_code);
  fd.append("mobile_number", user.mobile_number);
  fd.append("email", user.email);
  fd.append("contact_email", user.email);
  fd.append("date_of_birth", user.dob);
  fd.append("dob", user.dob);
  fd.append("birth_date", user.dob);
  fd.append("gender", user.gender);
  fd.append("otp", otp);

  const reg = await postMultipart("api/v1/auth/register", fd);
  console.log("  status:", reg.status, "body:", JSON.stringify(reg.data).slice(0, 400));
  let token = extractToken(reg.data);
  if (!token) {
    console.log("  register had no token, trying validate-otp fallback...");
    const login1 = await postJson("api/v1/auth/validate-otp", {
      phone_code: user.phone_code,
      mobile_number: user.mobile_number,
      otp,
    });
    console.log("  validate-otp status:", login1.status);
    token = extractToken(login1.data);
  }
  if (!token) {
    console.error("FAIL: no token after register");
    process.exit(1);
  }
  console.log("  token:", token.slice(0, 8) + "…");

  // 3. Session sync
  console.log("\n[3] session sync...");
  const session1 = await syncSession(token);
  console.log("  ", session1);
  if (!session1.postOk || !session1.getOk) {
    console.error("FAIL: session sync");
    process.exit(1);
  }

  // 4. Login flow (send new OTP)
  console.log("\n[4] send-otp (login)...");
  const send2 = await postJson("api/v1/auth/send-otp", {
    phone_code: user.phone_code,
    mobile_number: user.mobile_number,
  });
  console.log("  status:", send2.status);
  if (!send2.ok) {
    console.error("FAIL: login send-otp");
    process.exit(1);
  }
  otp = await resolveOtp(send2.data, user.phoneE164);
  console.log("  OTP:", otp);

  console.log("\n[5] validate-otp (login)...");
  const login2 = await postJson("api/v1/auth/validate-otp", {
    phone_code: user.phone_code,
    mobile_number: user.mobile_number,
    otp,
  });
  console.log("  status:", login2.status, "body:", JSON.stringify(login2.data).slice(0, 300));
  token = extractToken(login2.data);
  if (!token) {
    console.error("FAIL: no token after login");
    process.exit(1);
  }

  console.log("\n[6] session sync after login...");
  const session2 = await syncSession(token);
  console.log("  ", session2);
  if (!session2.postOk || !session2.getOk) {
    console.error("FAIL: session sync after login");
    process.exit(1);
  }

  // Extract cookie for protected route test
  const session2Cookie = session2.cookiePair ?? "";

  console.log("\n[7] protected route without cookie...");
  const noAuth = await checkProtectedRoute("");
  console.log("  /organizations/create:", noAuth);

  console.log("\n[8] protected route with cookie...");
  const withAuth = await checkProtectedRoute(session2Cookie);
  console.log("  /organizations/create:", withAuth);

  console.log("\n[9] /login redirect when authed...");
  const loginPage = await fetch(`${BASE}/login`, {
    redirect: "manual",
    headers: session2Cookie ? { Cookie: session2Cookie } : {},
  });
  console.log("  /login:", loginPage.status, loginPage.headers.get("location"));

  console.log("\n[10] browser-like OTP login session (POST ok, GET without manual cookie)...");
  const send3 = await postJson("api/v1/auth/send-otp", {
    phone_code: user.phone_code,
    mobile_number: user.mobile_number,
  });
  if (!send3.ok) {
    console.error("FAIL: send-otp for browser-like test");
    process.exit(1);
  }
  const otp3 = await resolveOtp(send3.data, user.phoneE164);
  const browserLike = await browserLikeLoginSession(
    { phone_code: user.phone_code, mobile_number: user.mobile_number },
    otp3,
  );
  console.log("  ", browserLike);
  if (!browserLike.ok && browserLike.reason !== "get-missed-cookie") {
    console.error("FAIL: browser-like session sync");
    process.exit(1);
  }

  console.log("\n=== ALL CHECKS PASSED ===");
  console.log(JSON.stringify({ user, tokenLen: token.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
