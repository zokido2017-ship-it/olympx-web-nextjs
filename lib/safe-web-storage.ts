/** Best-effort reads; returns null when storage is blocked (iframe sandbox, privacy mode, etc.). */

let sessionStorageBlocked: boolean | null = null;
let localStorageBlocked: boolean | null = null;

function probeSessionStorage(): boolean {
  if (sessionStorageBlocked !== null) return !sessionStorageBlocked;
  if (typeof window === "undefined") {
    sessionStorageBlocked = true;
    return false;
  }
  try {
    const storage = window.sessionStorage;
    storage.setItem("__olympx_probe__", "1");
    storage.removeItem("__olympx_probe__");
    sessionStorageBlocked = false;
    return true;
  } catch {
    sessionStorageBlocked = true;
    return false;
  }
}

function probeLocalStorage(): boolean {
  if (localStorageBlocked !== null) return !localStorageBlocked;
  if (typeof window === "undefined") {
    localStorageBlocked = true;
    return false;
  }
  try {
    const storage = window.localStorage;
    storage.setItem("__olympx_probe__", "1");
    storage.removeItem("__olympx_probe__");
    localStorageBlocked = false;
    return true;
  } catch {
    localStorageBlocked = true;
    return false;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  if (!probeLocalStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    localStorageBlocked = true;
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  if (!probeLocalStorage()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    localStorageBlocked = true;
    return false;
  }
}

export function safeLocalStorageRemove(key: string): void {
  if (!probeLocalStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    localStorageBlocked = true;
  }
}

export function safeSessionStorageGet(key: string): string | null {
  if (!probeSessionStorage()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    sessionStorageBlocked = true;
    return null;
  }
}

export function safeSessionStorageSet(key: string, value: string): boolean {
  if (!probeSessionStorage()) return false;
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    sessionStorageBlocked = true;
    return false;
  }
}

export function safeSessionStorageRemove(key: string): void {
  if (!probeSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    sessionStorageBlocked = true;
  }
}

export function isSessionStorageAvailable(): boolean {
  return probeSessionStorage();
}

export function isLocalStorageAvailable(): boolean {
  return probeLocalStorage();
}
