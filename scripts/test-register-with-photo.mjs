#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

const phoneSuffix = String(Date.now()).slice(-8);
const phoneCode = "91";
const mobileNumber = `9${phoneSuffix}`;

async function request(path, { method = "GET", body, formData } = {}) {
  const headers = { Accept: "application/json" };
  let payload = body;

  if (formData) {
    payload = formData;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
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

function createTestPng(path) {
  execSync(
    `python3 -c "import struct,zlib;w=h=100;raw=b''.join([b'\\\\x00'+bytes([0,0,255]*w) for _ in range(h)]);chunk=lambda t,d: struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff);png=b'\\\\x89PNG\\\\r\\\\n\\\\x1a\\\\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'');open('${path}','wb').write(png)"`,
  );
}

async function main() {
  console.log(`API: ${API_BASE}`);
  console.log(`Phone: +${phoneCode} ${mobileNumber}`);

  const otp = process.env.TEST_OTP || "2468";

  const sendOtp = await request("/auth/send-otp", {
    method: "POST",
    body: { phone_code: phoneCode, mobile_number: mobileNumber },
  });
  console.log("send-otp:", sendOtp.data);

  const validate = await request("/auth/validate-otp", {
    method: "POST",
    body: { phone_code: phoneCode, mobile_number: mobileNumber, otp },
  });
  console.log("validate-otp:", validate.data);

  if (!validate.ok) {
    process.exit(1);
  }

  const pngPath = "/tmp/register-test.png";
  createTestPng(pngPath);
  const formData = new FormData();
  formData.append("phone_code", phoneCode);
  formData.append("mobile_number", mobileNumber);
  formData.append("display_name", "Photo Register Test");
  formData.append("contact_email", `photo.${mobileNumber}@example.com`);
  formData.append("dob", "2000-01-01");
  formData.append("gender", "male");
  formData.append("nationality", "IN");
  formData.append("height_cm", "175");
  formData.append("weight_kg", "70");
  formData.append("ids[]", "1");
  formData.append("connected_app", "google_fit");
  formData.append(
    "photo",
    new Blob([readFileSync(pngPath)], { type: "image/png" }),
    "profile.png",
  );

  const register = await request("/auth/register", {
    method: "POST",
    formData,
  });

  console.log("register:", JSON.stringify(register.data, null, 2));
  process.exit(register.ok && register.data?.player?.id ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
