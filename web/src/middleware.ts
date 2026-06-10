import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseToken } from "./lib/helpers";
import { IUserRole } from "./interfaces/auth";

export function middleware(request: NextRequest) {
  const authPaths = ["/", "sign-in"];
  const adminPaths = ["/admin"];
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  const authJWT = request.cookies.get("jwt");
  const timeNow = Date.now() / 1000;

  if (authJWT?.value) {
    const jwtInfo = parseToken(authJWT.value);

    // Check if token is expired
    if (timeNow > jwtInfo?.exp) {
      const response = NextResponse.redirect(new URL("/", request.url));

      // Delete the token cookie
      response.cookies.delete("jwt");

      // Return the response
      return response;
    }

    // Check if user is an admin
    const isAdmin = jwtInfo?.role === IUserRole.ADMIN;

    if (isAdmin) {
      // Admin users can access all /admin and /dashboard routes
      if (path.startsWith("/admin") || path.startsWith("/dashboard")) {
        return response;
      }
    } else {
      // Non-admin users trying to access admin paths should be redirected back to home
      if (adminPaths.includes(path) || path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Redirect authenticated users from auth paths to the dashboard
    if (authPaths.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // Unauthenticated users trying to access protected paths should be redirected to home
    if (path.startsWith("/dashboard") || path.startsWith("/welcome") || adminPaths.includes(path)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
