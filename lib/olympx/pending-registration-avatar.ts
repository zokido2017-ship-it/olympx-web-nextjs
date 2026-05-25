import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";

const AVATAR_KEY = "olympx_register_avatar_v1";
const MAX_BYTES = 2 * 1024 * 1024;

export const PROFILE_IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type PendingRegistrationAvatar = {
  dataUrl: string;
  mime: string;
  fileName: string;
};

let memoryAvatar: PendingRegistrationAvatar | null = null;

export function validateProfileImageFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }
  return null;
}

export function fileFromPendingAvatar(
  pending: PendingRegistrationAvatar,
): File | null {
  try {
    const [header, base64] = pending.dataUrl.split(",");
    if (!base64) return null;
    const mimeMatch = header.match(/data:([^;]+);/);
    const mime = mimeMatch?.[1] ?? pending.mime;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], pending.fileName || "profile.jpg", { type: mime });
  } catch {
    return null;
  }
}

export async function storePendingRegistrationAvatar(
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validation = validateProfileImageFile(file);
  if (validation) return { ok: false, error: validation };

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });

  const payload: PendingRegistrationAvatar = {
    dataUrl,
    mime: file.type,
    fileName: file.name,
  };

  memoryAvatar = payload;
  const json = JSON.stringify(payload);
  if (json.length > 4_500_000) {
    memoryAvatar = null;
    return { ok: false, error: "Image is too large to store for this step." };
  }

  safeSessionStorageSet(AVATAR_KEY, json);
  return { ok: true };
}

export function readPendingRegistrationAvatar(): PendingRegistrationAvatar | null {
  const raw = safeSessionStorageGet(AVATAR_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PendingRegistrationAvatar;
      if (parsed?.dataUrl && parsed?.mime) return parsed;
    } catch {
      /* ignore */
    }
  }
  return memoryAvatar;
}

export function clearPendingRegistrationAvatar(): void {
  memoryAvatar = null;
  safeSessionStorageRemove(AVATAR_KEY);
  safeLocalStorageRemove(AVATAR_KEY);
}
