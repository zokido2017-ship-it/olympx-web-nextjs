import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isOlympxAuthBypassed } from "@/lib/olympx/auth-bypass";
import { authDebug } from "@/lib/olympx/auth-debug";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";

function hasSessionToken(request: NextRequest): boolean {
  const v = request.cookies.get(OLYMPX_ACCESS_TOKEN_KEY)?.value;
  return Boolean(v && v.trim());
}

export function middleware(request: NextRequest) {
  if (isOlympxAuthBypassed()) {
    authDebug("middleware", "auth bypass active — skipping redirects", {
      pathname: request.nextUrl.pathname,
    });
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const cookieRaw = request.cookies.get(OLYMPX_ACCESS_TOKEN_KEY)?.value;
  const authed = hasSessionToken(request);

  authDebug("middleware", "auth check", {
    pathname,
    sessionCookiePresent: authed,
    cookieValueLength: cookieRaw?.length ?? 0,
  });

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
      authDebug("middleware", "redirect reason: no olympx_access_token cookie on request", {
        to: "/login",
        pathname,
        nextParam: pathname + request.nextUrl.search,
      });
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    authDebug("middleware", "allow: session cookie present (admin hub)", {
      pathname,
    });
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    if (!authed) {
      authDebug("middleware", "redirect reason: no olympx_access_token cookie on request", {
        to: "/login",
        pathname,
        nextParam: pathname + request.nextUrl.search,
      });
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    authDebug("middleware", "allow: session cookie present", { pathname });
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

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/organizations/:path*",
    "/teams",
    "/teams/:path*",
    "/players",
    "/players/:path*",
    "/login",
  ],
};
