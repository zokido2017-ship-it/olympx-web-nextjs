import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Fixes mistyped URLs like `/player-profile.` → `/player-profile`. */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.length > 1 && /\.$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\.+$/, "") || "/";
    url.search = search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
