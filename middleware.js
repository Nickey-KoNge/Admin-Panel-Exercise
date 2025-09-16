// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!token;
  const isLoginPage = pathname.startsWith("/login");

  if (isLoggedIn) {
    if (isLoginPage) {
 
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/") {
      const role = token.role_id;
      if (role === 1) {
        return NextResponse.redirect(new URL("/admin/leaverequest", req.url));
      } else {
        return NextResponse.redirect(new URL("/leaverequest", req.url));
      }
    }

    if (pathname.startsWith("/admin") && token.role_id !== 1) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/checkin-out", "/leaverequest", "/admin/:path*"],
};
