// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {

  interface JWT extends DefaultJWT {
    role_id?: number;
  }
}
declare module "next-auth" {
  
  interface Session {
    user?: {
      role_id?: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role_id?: number;
  }
}