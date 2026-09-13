#!/usr/bin/env node

/**
 * End-to-end API check for player registration.
 *
 * Usage:
 *   node scripts/test-player-registration.mjs
 *   TEST_AUTH_TOKEN=... node scripts/test-player-registration.mjs
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.sportxo.in/api/v1"
).replace(/\/$/, "");
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || new URL(API_BASE).origin
).replace(/\/$/, "");

const phoneSuffix = String(Date.now()).slice(-8);
const phoneCode = "91";
const mobileNumber = `9${phoneSuffix}`;

function log(step, message, extra) {
  const prefix = extra ? ` ${JSON.stringify(extra)}` : "";
  console.log(`[${step}] ${message}${prefix}`);
}

async function request(path, { method = "GET", body, token, origin = API_BASE } = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${origin}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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

function extractToken(payload) {
  if (!payload || typeof payload !== "object") return null;
  const direct = payload.token || payload.access_token;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  if (payload.data && typeof payload.data === "object") {
    const nested = payload.data.token || payload.data.access_token;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
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

  log("INFO", `API base: ${API_BASE}`);
  log("INFO", `Test phone: +${phoneCode} ${mobileNumber}`);

  const sendOtp = await request("/auth/send-otp", {
    method: "POST",
    body: { phone_code: phoneCode, mobile_number: mobileNumber },
  });
  assert("send-otp", sendOtp.ok, sendOtp.data);

  const register = await request("/auth/register", {
    method: "POST",
    body: {
      phone_code: phoneCode,
      mobile_number: mobileNumber,
      first_name: "E2E",
      last_name: "Player",
      display_name: "E2E Player",
      contact_email: `e2e.${mobileNumber}@example.com`,
    },
  });
  assert("register-user", register.ok && register.data?.id, register.data);

  const duplicateRegister = await request("/auth/register", {
    method: "POST",
    body: {
      phone_code: phoneCode,
      mobile_number: mobileNumber,
      first_name: "E2E",
      last_name: "Player",
      display_name: "E2E Player",
    },
  });
  assert(
    "register-duplicate-blocked",
    duplicateRegister.status === 422 &&
      String(duplicateRegister.data?.message || "")
        .toLowerCase()
        .includes("taken"),
    duplicateRegister.data,
  );

  const userId = register.data?.id;
  const playerWithoutAuth = await request("/players", {
    method: "POST",
    body: {
      user_id: userId,
      first_name: "E2E",
      last_name: "Player",
      display_name: "E2E Player",
      profile: {
        sport_ids: [5],
        setup_step: 3,
        profile_complete: true,
      },
    },
  });
  assert(
    "players-require-auth",
    playerWithoutAuth.status === 401,
    playerWithoutAuth.data,
  );

  const sports = await request("/sports");
  assert(
    "sports-list",
    sports.ok && Array.isArray(sports.data?.data) && sports.data.data.length > 0,
    { count: sports.data?.data?.length ?? 0 },
  );

  const envToken = process.env.TEST_AUTH_TOKEN?.trim();
  if (!envToken) {
    log(
      "SKIP",
      "Authenticated player create/update (set TEST_AUTH_TOKEN to run this step)",
    );
  } else {
    const me = await request("/api/me", { token: envToken, origin: API_ORIGIN });
    assert("api-me", me.ok && me.data?.id, me.data);

    const createPlayer = await request("/players", {
      method: "POST",
      token: envToken,
      body: {
        user_id: me.data.id,
        first_name: "E2E",
        last_name: "Player",
        display_name: "E2E Player",
        contact_email: me.data.contact_email || `e2e.${mobileNumber}@example.com`,
        profile: {
          sport_ids: [sports.data.data[0].id],
          height: "175",
          weight: "70",
          setup_step: 3,
          profile_complete: true,
        },
      },
    });
    assert("create-player", createPlayer.ok && createPlayer.data?.id, createPlayer.data);

    if (createPlayer.data?.id) {
      const fetched = await request(`/players/${createPlayer.data.id}`, {
        token: envToken,
      });
      assert(
        "fetch-player",
        fetched.ok && fetched.data?.profile?.profile_complete === true,
        fetched.data?.profile,
      );
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
