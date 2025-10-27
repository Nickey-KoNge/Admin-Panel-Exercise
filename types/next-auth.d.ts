
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

interface IUser {
  id: string | number;    
  name?: string | null;
  email?: string | null;
  role_id: number;
  accessToken?: string;
  refreshToken?: string;
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user?: IUser;
    accessToken?: string;
    refreshToken?: string;
    role_id?: number;
  }
}

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string | number;   // ✅ same here
    role_id: number;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: IUser;
    accessToken?: string;
  }
}
