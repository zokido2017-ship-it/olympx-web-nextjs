/** Public Firebase web SDK env keys (embedded at build time in Next.js). */
export const FIREBASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebasePublicEnvKey = (typeof FIREBASE_PUBLIC_ENV_KEYS)[number];

/** Typical unedited `.env.example` placeholders — Firebase will not work until replaced. */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^your_api_key$/i,
  /^your_project\.firebaseapp\.com$/i,
  /^your_project_id$/i,
  /^your_project\.appspot\.com$/i,
  /^your_sender_id$/i,
  /^your_app_id$/i,
];

function isUnsetOrPlaceholder(value: string | undefined): boolean {
  const t = String(value ?? "").trim();
  if (!t) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(t));
}

/**
 * Missing or still-example values for Firebase client config (browser).
 */
export function getMissingFirebasePublicEnvVars(): FirebasePublicEnvKey[] {
  const entries: Record<FirebasePublicEnvKey, string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  return FIREBASE_PUBLIC_ENV_KEYS.filter((k) =>
    isUnsetOrPlaceholder(entries[k]),
  );
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebasePublicEnvVars().length === 0;
}
