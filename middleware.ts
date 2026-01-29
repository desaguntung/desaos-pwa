import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Double check for public paths in case matcher regex misses something
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("desaos-auth");
  const isLoggedIn = authCookie?.value === "1";

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - $ (root path /)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|$).*)",
  ],
};
