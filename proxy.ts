import type { NextRequest } from "next/server";

import {
  handleOlympxAuthProxy,
  olympxAuthProxyMatcher,
} from "@/lib/olympx/auth-proxy-handler";

/** Next.js 16+ network boundary auth (replaces deprecated middleware.ts). */
export function proxy(request: NextRequest) {
  return handleOlympxAuthProxy(request);
}

export const config = {
  matcher: olympxAuthProxyMatcher,
};
