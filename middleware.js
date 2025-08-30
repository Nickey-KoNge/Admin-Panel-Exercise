// // middleware.ts
// import { withAuth } from "next-auth/middleware";

// export default withAuth({
//   callbacks: {
//     authorized: ({ token }) => {
//       // Your role-checking logic
//       return token?.role_id === 1;
//     },
//   },
// });

// export const config = {
//   // The matcher should be the only property here
//   matcher: [
//     "/",
//     "/leaverequest",
//   ],
// };

// // export { default } from "next-auth/middleware";

// // export const config = {
// //   matcher: ["/admin/:path*"],
// // };


// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token) {
    if (pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role_id;

  if (pathname === "/") {
    if (role === 1) {
      return NextResponse.redirect(new URL("/admin/leave-request", req.url));
    }
    if (role === 2) {
      return NextResponse.redirect(new URL("/leaverequest", req.url));
    }
    if (role === 3) {
      return NextResponse.redirect(new URL("/leaverequest", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== 1) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login","/checkin-out","/leaverequest", "/admin/:path*"],
};
