// // middleware.js
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(req) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const { pathname } = req.nextUrl;

//   if (!token) {
//     if (pathname.startsWith("/login")) {
//       return NextResponse.next();
//     }
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const role = token.role_id;

//   if (pathname === "/") {
//     if (role === 1) {
//       return NextResponse.redirect(new URL("/admin/leave-request", req.url));
//     }
//     if (role === 2) {
//       return NextResponse.redirect(new URL("/leaverequest", req.url));
//     }
//     if (role === 3) {
//       return NextResponse.redirect(new URL("/leaverequest", req.url));
//     }
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   if (pathname.startsWith("/admin") && role !== 1) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/login","/checkin-out","/leaverequest", "/admin/:path*"],
// };

// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!token;
  const isLoginPage = pathname.startsWith("/login");

  // --- Rule 1: User already logged-in ---
  if (isLoggedIn) {
    if (isLoginPage) {
      // login ဖြစ်ပြီးသား user ကို login page မသွားနိုင်အောင် တား
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

  // --- Rule 2: User not logged-in ---
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/checkin-out", "/leaverequest", "/admin/:path*"],
};
