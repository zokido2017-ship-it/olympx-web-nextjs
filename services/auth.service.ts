"use client";

import {
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  browserLocalPersistence,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  PHONE_E164_KEY,
  PHONE_VERIFICATION_ID_KEY,
} from "@/types/auth";

export function mapFirebaseAuthError(code: string): string {
  const table: Record<string, string> = {
    "auth/email-already-in-use":
      "That email already has an account. Try signing in instead.",
    "auth/invalid-email": "That email looks invalid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No matching account.",
    "auth/invalid-credential": "Invalid credentials. Please try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/popup-blocked": "Popup was blocked by the browser.",
    "auth/account-exists-with-different-credential":
      "An account exists with different sign-in credentials.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/invalid-phone-number": "The phone number format is invalid.",
    "auth/missing-phone-number": "Phone number is required.",
    "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
    "auth/captcha-check-failed": "reCAPTCHA validation failed. Try again.",
    "auth/invalid-verification-code": "Invalid verification code.",
    "auth/code-expired": "This code has expired. Request a new one.",
    "auth/credential-already-in-use":
      "This phone number is already linked to another account.",
    "permission-denied":
      "Could not save your profile — check Firestore security rules.",
  };
  return table[code] ?? "Something went wrong. Please try again.";
}

function ensureRecaptcha(): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  const container = document.getElementById("recaptcha-container");
  if (!container) {
    throw new Error("reCAPTCHA container is missing from the page.");
  }
  return new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });
}

/** Sends Firebase SMS OTP; stores verification id + E.164 in sessionStorage for `/verify-otp`. */
export async function startPhoneVerification(phoneE164: string): Promise<void> {
  const auth = getFirebaseAuth();
  const verifier = ensureRecaptcha();
  const provider = new PhoneAuthProvider(auth);
  let verificationId: string;
  try {
    verificationId = await provider.verifyPhoneNumber(
      phoneE164,
      verifier,
    );
  } finally {
    try {
      verifier.clear();
    } catch {
      /* ignore teardown errors */
    }
  }

  if (typeof window === "undefined") return;
  sessionStorage.setItem(PHONE_VERIFICATION_ID_KEY, verificationId);
  sessionStorage.setItem(PHONE_E164_KEY, phoneE164);
}

export async function verifyPhoneOtp(code: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (typeof window === "undefined") {
    throw new Error("OTP verification is browser-only.");
  }

  const verificationId = sessionStorage.getItem(PHONE_VERIFICATION_ID_KEY);
  if (!verificationId) {
    throw new Error("Verification session expired. Request a new code.");
  }

  const credential = PhoneAuthProvider.credential(verificationId, code);
  await signInWithCredential(auth, credential);

  sessionStorage.removeItem(PHONE_VERIFICATION_ID_KEY);
  sessionStorage.removeItem(PHONE_E164_KEY);
}

export function clearPhoneVerificationSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PHONE_VERIFICATION_ID_KEY);
  sessionStorage.removeItem(PHONE_E164_KEY);
}

export async function loginWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(auth, provider);
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export function subscribeToAuth(
  onChange: (user: User | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const auth = getFirebaseAuth();
    return auth.onAuthStateChanged(onChange);
  } catch {
    console.warn(
      "Firebase initialization failed — check NEXT_PUBLIC_FIREBASE_* env vars.",
    );
    onChange(null);
    return () => {};
  }
}
