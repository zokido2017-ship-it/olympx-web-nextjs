/**
 * Set `NEXT_PUBLIC_OLYMPX_AUTH_BYPASS=true` in `.env.local` to disable middleware
 * redirects and the dashboard/profile client guard. Use only for local debugging.
 * Remove or set to false before shipping.
 */
export function isOlympxAuthBypassed(): boolean {
  return process.env.NEXT_PUBLIC_OLYMPX_AUTH_BYPASS === "true";
}
