/**
 * E2E: Laravel OTP -> Next session -> BFF create -> list
 * Usage: node scripts/verify-create-organisation.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const laravel = (process.env.OLYMPEX_API_BASE_URL ?? "http://127.0.0.1:8000").replace(
  /\/+$/,
  "",
);

async function json(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return { res, data };
}

const slug = `verify-${Date.now()}`;
console.log("1) OTP validate (Laravel)…");
const { data: auth } = await json(`${laravel}/api/v1/auth/validate-otp`, {
  method: "POST",
  body: JSON.stringify({
    phone_code: "91",
    mobile_number: "8923907897",
    otp: "2468",
  }),
});
const token = auth.token ?? auth.data?.token;
if (!token) throw new Error("no token from validate-otp");

console.log("2) Sync session cookie (Next)…");
const jar = new Map();
const sessionRes = await fetch(`${base}/api/auth/olympx-session`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ token }),
});
const setCookie = sessionRes.headers.getSetCookie?.() ?? [];
for (const c of setCookie) {
  const m = c.match(/^([^=]+)=([^;]+)/);
  if (m) jar.set(m[1], m[2]);
}
if (!sessionRes.ok) {
  const t = await sessionRes.text();
  throw new Error(`session POST ${sessionRes.status}: ${t}`);
}
const cookieHeader = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

console.log("3) Create org via BFF…");
const payload = {
  name: `Verify Org ${slug}`,
  slug,
  description: "verify-create-organisation.mjs",
  website: "example.com",
  settings: { category: "pro", location: "Test" },
};
const { data: created } = await json(`${base}/api/organisations`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  },
  body: JSON.stringify(payload),
});

console.log("4) List orgs via proxy…");
const { data: list } = await json(
  `${base}/api/olympx/api/v1/organisations?per_page=50`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  },
);
const rows = list.data ?? [];
const found = rows.some((o) => o.slug === slug);
if (!found) throw new Error(`created org ${slug} not in list (${rows.length} rows)`);

console.log(`OK created "${created.name ?? payload.name}" slug=${slug}`);
