"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { User } from "firebase/auth";

import { getFirebaseDb } from "@/lib/firebase/client";
import type { Gender, StoredAuthProvider, UserProfileDoc } from "@/types/user-profile";

export class DuplicateRegistrationEmailError extends Error {
  readonly code = "registration/email-already-used" as const;

  constructor() {
    super("This email is already registered.");
    this.name = "DuplicateRegistrationEmailError";
  }
}

function deriveAuthProvider(user: User): StoredAuthProvider {
  const pid = user.providerData[0]?.providerId;
  if (pid === "google.com") return "google.com";
  if (pid === "phone") return "phone";
  return "email";
}

function registrationDocIdFromNormalizedEmail(normalizedEmail: string): string {
  const bytes = new TextEncoder().encode(normalizedEmail);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  let b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
  b64 = b64.replace(/=+$/, "");
  return `reg_${b64}`.slice(0, 1200);
}

/**
 * Saves or merges the signed-in user's profile doc at `users/{uid}`.
 * Preserves gender (and optional fields) already stored when syncing Google/Phone logins.
 */
export async function syncUserProfileFromAuth(user: User): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const prev = snap.data() as Partial<UserProfileDoc> | undefined;

  const fullName =
    user.displayName?.trim() ||
    prev?.fullName ||
    "";
  const email = user.email?.trim() || prev?.email || "";
  const phoneNumber =
    user.phoneNumber?.trim() ||
    prev?.phoneNumber ||
    "";
  const gender: Gender =
    prev?.gender && ["male", "female", "other"].includes(prev.gender)
      ? prev.gender
      : "other";

  await setDoc(
    ref,
    {
      fullName,
      email,
      phoneNumber,
      gender,
      authProvider: deriveAuthProvider(user),
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

/**
 * Passwordless registration: writes to `registrations/{encodedEmail}`.
 * Does not create a Firebase Auth user.
 */
export async function saveRegistrationRecord(input: {
  fullName: string;
  email: string;
  phoneE164: string;
  gender: Gender;
}): Promise<void> {
  const db = getFirebaseDb();
  const emailNormalized = input.email.trim().toLowerCase();

  const parsed = parsePhoneNumberFromString(input.phoneE164);
  if (!parsed?.isValid()) {
    throw new Error("Invalid phone number.");
  }

  const countryCode = `+${parsed.countryCallingCode}`;
  const phoneNumber = parsed.format("E.164");

  const ref = doc(
    db,
    "registrations",
    registrationDocIdFromNormalizedEmail(emailNormalized),
  );
  const snap = await getDoc(ref);
  if (snap.exists()) {
    throw new DuplicateRegistrationEmailError();
  }

  await setDoc(ref, {
    fullName: input.fullName.trim(),
    email: emailNormalized,
    phoneNumber,
    countryCode,
    gender: input.gender,
    authProvider: "registration",
    createdAt: serverTimestamp(),
  });
}

export function mapRegistrationSaveError(error: unknown): string {
  if (error instanceof DuplicateRegistrationEmailError) {
    return error.message;
  }
  const code =
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";
  if (code === "permission-denied") {
    return "Could not save your registration.";
  }
  if (error instanceof Error) {
    const m = error.message;
    if (/not configured|NEXT_PUBLIC_/i.test(m)) {
      return "Saving isn’t available in this environment.";
    }
    return m;
  }
  return "Something went wrong. Please try again.";
}
