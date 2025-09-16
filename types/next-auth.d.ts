// /types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
interface IUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

declare module "next-auth/jwt" {

  interface JWT extends DefaultJWT {
    accessToken?: string;
    user?: IUser; 
  }
}

declare module "next-auth" {
 
  interface User {
    user: IUser;
    accessToken: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken?: string;
    user: IUser; 
  }
}