// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Your role-checking logic
      return token?.role_id === 1;
    },
  },
});

export const config = {
  // The matcher should be the only property here
  matcher: [
    "/admin",
    "/admin/leaverequest",
  ],
};

// export { default } from "next-auth/middleware";

// export const config = {
//   matcher: ["/admin/:path*"],
// };