/**

 * Persistent auth-flow journal (sessionStorage + in-memory fallback + console).

 * Traces OTP → session cookie → proxy → guard end-to-end.

 * Inspect in DevTools: sessionStorage.getItem("olympx_auth_flow_journal")

 * (when storage is allowed on that document)

 */

import { AUTH_FLOW_DEBUG, authDebug } from "@/lib/olympx/auth-debug";

import { authDebugMaskToken } from "@/lib/olympx/auth-debug";

import { logAuthStorageSnapshot } from "@/lib/olympx/auth-storage-snapshot";

import {

  safeSessionStorageGet,

  safeSessionStorageRemove,

  safeSessionStorageSet,

} from "@/lib/safe-web-storage";



export const AUTH_FLOW_JOURNAL_KEY = "olympx_auth_flow_journal";

export const AUTH_FLOW_ID_KEY = "olympx_auth_flow_id";



export type AuthFlowJournalEntry = {

  t: number;

  step: string;

  flowId: string | null;

  detail?: Record<string, unknown>;

};



const MAX_JOURNAL_ENTRIES = 80;



/** When sessionStorage is blocked (sandbox, /api document, privacy mode). */

let memoryJournal: AuthFlowJournalEntry[] = [];

let memoryFlowId: string | null = null;



function readJournal(): AuthFlowJournalEntry[] {

  const raw = safeSessionStorageGet(AUTH_FLOW_JOURNAL_KEY);

  if (raw) {

    try {

      const parsed = JSON.parse(raw) as AuthFlowJournalEntry[];

      if (Array.isArray(parsed)) return parsed;

    } catch {

      /* corrupt */

    }

  }

  return memoryJournal;

}



function writeJournal(entries: AuthFlowJournalEntry[]): void {

  const trimmed = entries.slice(-MAX_JOURNAL_ENTRIES);

  memoryJournal = trimmed;

  safeSessionStorageSet(AUTH_FLOW_JOURNAL_KEY, JSON.stringify(trimmed));

}



export function getActiveFlowId(): string | null {

  return safeSessionStorageGet(AUTH_FLOW_ID_KEY) ?? memoryFlowId;

}



export function setActiveFlowId(flowId: string): void {

  memoryFlowId = flowId;

  safeSessionStorageSet(AUTH_FLOW_ID_KEY, flowId);

}



export function clearAuthFlowJournal(): void {

  memoryJournal = [];

  memoryFlowId = null;

  safeSessionStorageRemove(AUTH_FLOW_JOURNAL_KEY);

  safeSessionStorageRemove(AUTH_FLOW_ID_KEY);

}



export function readAuthFlowJournal(): AuthFlowJournalEntry[] {

  return readJournal();

}



/** Record a step in the persistent journal + dev console. Never throws. */

export function recordAuthFlowStep(

  step: string,

  detail?: Record<string, unknown>,

): void {

  try {

    const flowId = getActiveFlowId();

    const entry: AuthFlowJournalEntry = {

      t: Date.now(),

      step,

      flowId,

      detail: sanitizeDetail(detail),

    };



    writeJournal([...readJournal(), entry]);



    if (AUTH_FLOW_DEBUG && typeof window !== "undefined") {

      authDebug("journal", step, { flowId, ...entry.detail });

    }

  } catch {

    /* storage blocked — auth flow must continue */

  }

}



function sanitizeDetail(

  detail?: Record<string, unknown>,

): Record<string, unknown> | undefined {

  if (!detail) return undefined;

  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(detail)) {

    if (

      (key === "token" || key.endsWith("Token")) &&

      typeof value === "string" &&

      value.length > 8

    ) {

      out[key] = authDebugMaskToken(value);

      continue;

    }

    out[key] = value;

  }

  return out;

}



/** Snapshot storage + record step (client only). Never throws. */

export function recordAuthFlowStepWithStorage(

  step: string,

  detail?: Record<string, unknown>,

): void {

  try {

    logAuthStorageSnapshot(step);

  } catch {

    /* document.cookie / storage blocked */

  }

  recordAuthFlowStep(step, detail);

}


