"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { isFirebaseConfigured } from "@/lib/firebase/env";

/**
 * Reads public Firebase web config from environment variables.
 * Variable names MUST be exactly `NEXT_PUBLIC_FIREBASE_*` (see `.env.example`).
 */
function getFirebaseConfig() {
  if (!isFirebaseConfigured()) {
    throw new Error("Service is not configured.");
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/**
 * Lazily initializes the Firebase client app (browser only).
 */
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client must only be used in the browser.");
  }
  if (!app) {
    const existing = getApps()[0];
    app = existing ?? initializeApp(getFirebaseConfig());
  }
  return app;
}

/**
 * Firebase Auth instance tied to the single client app.
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/** Browser Firestore client (same Firebase app instance as Auth). */
export function getFirebaseDb(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("Firestore client must only be used in the browser.");
  }
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
