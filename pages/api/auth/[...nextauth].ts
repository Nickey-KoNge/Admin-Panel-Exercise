// /pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) return null;

          const data = await res.json();
          if (data) {
            // This 'data' object matches the 'User' interface we defined
            return data;
          }
          return null;
        } catch (error) {
          console.error("Login Error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // The 'user' parameter now correctly has the type: { user: IUser, accessToken: string }
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        // Extract the nested user object
        token.user = user.user;
      }
      return token;
    },

    // The 'token' parameter now correctly has the type: { user?: IUser, accessToken?: string }
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.user) {
        // Assign the user object to the session
        session.user = token.user;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
