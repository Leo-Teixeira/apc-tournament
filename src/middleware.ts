// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token =
    request.nextUrl.searchParams.get("token") ||
    request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/error/unauthorized", request.url));
  }

  const res = await fetch(
    "https://aqua-bat-544144.hostingersite.com/wp-json/custom/validate-token",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    return NextResponse.redirect(new URL("/error/unauthorized", request.url));
  }

  const response = NextResponse.next();
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60
  });
  return response;
}

export const config = {
  matcher: ["/((?!unauthorized|_next|favicon.ico).*)"]
};
