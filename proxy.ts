import { NextResponse, type NextRequest } from "next/server";
import {
  PREVIEW_ACCESS_COOKIE,
  hasPreviewAccess,
  isAuthorized,
  isBasicAuthEnabled,
  isUngatedPath,
  wwwAuthenticateValue,
} from "@/lib/basic-auth";

// Every request needs Basic credentials or the preview access cookie that /api/draft
// sets. See lib/basic-auth.ts for why the cookie exists.
export function proxy(request: NextRequest): NextResponse {
  if (!isBasicAuthEnabled() || isUngatedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (
    isAuthorized(request.headers.get("authorization")) ||
    hasPreviewAccess(request.cookies.get(PREVIEW_ACCESS_COOKIE)?.value)
  ) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": wwwAuthenticateValue(),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

// Build assets hold no content, so they are served without the check.
export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
