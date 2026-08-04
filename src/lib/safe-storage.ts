const memoryLocal = new Map<string, string>();
const memorySession = new Map<string, string>();

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function safeLocalGetItem(key: string): string | null {
  const storage = getLocalStorage();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      /* fall through to memory */
    }
  }
  return memoryLocal.get(key) ?? null;
}

export function safeLocalSetItem(key: string, value: string): void {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memoryLocal.set(key, value);
}

export function safeLocalRemoveItem(key: string): void {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  memoryLocal.delete(key);
}

export function safeSessionGetItem(key: string): string | null {
  const storage = getSessionStorage();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      /* fall through to memory */
    }
  }
  return memorySession.get(key) ?? null;
}

export function safeSessionSetItem(key: string, value: string): void {
  const storage = getSessionStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memorySession.set(key, value);
}

export function safeSessionRemoveItem(key: string): void {
  const storage = getSessionStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  memorySession.delete(key);
}
