import { OLYMPX_SESSION_COMPLETE_PATH } from "@/lib/olympx/complete-session-navigation";

/** Top-level form POST → Set-Cookie on API route, then GET /auth/session-complete confirms + redirects. */
export function submitSessionCompleteForm(
  token: string,
  nextPath: string,
): void {
  if (typeof document === "undefined") return;
  const trimmed = token.trim();
  if (!trimmed) return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = OLYMPX_SESSION_COMPLETE_PATH;
  form.style.display = "none";

  const tokenField = document.createElement("input");
  tokenField.type = "hidden";
  tokenField.name = "token";
  tokenField.value = trimmed;
  form.appendChild(tokenField);

  const nextField = document.createElement("input");
  nextField.type = "hidden";
  nextField.name = "next";
  nextField.value = nextPath;
  form.appendChild(nextField);

  document.body.appendChild(form);
  form.submit();
}
