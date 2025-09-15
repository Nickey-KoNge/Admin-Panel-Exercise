// /types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// 1. Define the shape of the user object coming from your NestJS backend
interface IUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

// 2. Extend the built-in session and token types
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback */
  interface JWT extends DefaultJWT {
    accessToken?: string;
    user?: IUser; // The user object from your backend
  }
}

declare module "next-auth" {
  /** The shape of the `user` object returned from the `authorize` callback */
  interface User {
    user: IUser;
    accessToken: string;
    refreshToken?: string;
  }

  /** Returned by `useSession`, `getSession`, etc. */
  interface Session {
    accessToken?: string;
    user: IUser; // The final user object in the frontend session
  }
}