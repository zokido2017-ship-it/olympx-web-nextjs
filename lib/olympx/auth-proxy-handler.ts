import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  isOlympxAuthBypassedForPath,
  isOlympxDevHubAccessBypassed,
} from "@/lib/olympx/auth-bypass";
import { authDebug } from "@/lib/olympx/auth-debug";
import { trace } from "@/lib/olympx/auth-flow-trace";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import {
  isAuthMiddlewarePrefetch,
  middlewareRequestKind,
} from "@/lib/olympx/middleware-request-kind";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";
import { hasSessionTokenOnRequest } from "@/lib/olympx/session-store";

/** Routes where auth redirects apply (everything else passes through immediately). */
function isAuthProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/profile")) return true;
  if (pathname.startsWith("/organizations")) return true;
  if (pathname.startsWith("/teams")) return true;
  if (pathname.startsWith("/players")) return true;
  return false;
}

/** Shared auth redirect logic for proxy (Next.js 16+). */
export function handleOlympxAuthProxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!isAuthProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const requestKind = middlewareRequestKind(request);
  const isPrefetch = isAuthMiddlewarePrefetch(request);

  if (isOlympxAuthBypassedForPath(pathname)) {
    authDebug("middleware", "auth bypass active — skipping redirects", {
      pathname,
    });
    return NextResponse.next();
  }

  // TODO: Restore proper authentication — remove dev hub bypass (require HTTP session cookie).
  if (isOlympxDevHubAccessBypassed(pathname)) {
    authDebug("middleware", "DEV BYPASS: allow management hub without HTTP cookie", {
      pathname,
    });
    return NextResponse.next();
  }

  const cookieRaw = request.cookies.get(OLYMPX_ACCESS_TOKEN_KEY)?.value;
  const authed = hasSessionTokenOnRequest(request);

  authDebug("middleware", "auth check", {
    pathname,
    requestKind,
    isPrefetch,
    sessionCookiePresent: authed,
    cookieValueLength: cookieRaw?.length ?? 0,
  });

  if (isPrefetch && !authed) {
    authDebug("middleware", "skip redirect: prefetch/RSC without cookie yet", {
      pathname,
    });
    return NextResponse.next();
  }

  if (pathname === "/" && authed) {
    authDebug("middleware", "redirect reason: home → app default (session cookie)", {
      to: DEFAULT_POST_LOGIN_PATH,
      pathname,
    });
    return NextResponse.redirect(new URL(DEFAULT_POST_LOGIN_PATH, request.url));
  }

  if (
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/teams") ||
    pathname.startsWith("/players")
  ) {
    if (!authed) {
      trace("middleware.redirect_login", {
        failurePoint: "lib/olympx/auth-proxy-handler.ts:96-99",
        pathname,
        requestKind,
        nextParam: pathname + request.nextUrl.search,
      });
      authDebug("middleware", "FAIL → redirect login (no HTTP session cookie)", {
        failurePoint: "proxy.auth-proxy-handler.ts",
        reason:
          "proxy only reads Cookie header olympx_access_token; localStorage is invisible here",
        to: "/login",
        pathname,
        requestKind,
        nextParam: pathname + request.nextUrl.search,
        cookieHeaderPresent: Boolean(cookieRaw),
        cookieValueLength: cookieRaw?.length ?? 0,
      });
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    authDebug("middleware", "PASS → session cookie present", {
      pathname,
      requestKind,
      cookieValueLength: cookieRaw?.length ?? 0,
    });
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    if (!authed) {
      authDebug("middleware", "redirect reason: no olympx_access_token cookie on request", {
        to: "/login",
        pathname,
        requestKind,
        nextParam: pathname + request.nextUrl.search,
      });
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    authDebug("middleware", "allow: session cookie present", { pathname, requestKind });
    return NextResponse.next();
  }

  if (pathname === "/login" && authed) {
    const next = request.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : DEFAULT_POST_LOGIN_PATH;
    authDebug("middleware", "redirect reason: already logged in (cookie)", {
      to: dest,
      pathname,
    });
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

/** Exclude API routes and static assets from proxy invocation. */
export const olympxAuthProxyMatcher = [
  "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
];
