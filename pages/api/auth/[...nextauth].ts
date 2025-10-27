

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
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

          if (data?.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role_id: data.user.role_id,
              accessToken: data.accessToken,
            };
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
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.accessToken = user.accessToken;
        token.role_id = user.role_id;
      }
      return token;
    },
async session({ session, token }) {
  if (token?.user && typeof token.user === "object") {
    session.user = token.user as any; 
  }
  session.accessToken = token.accessToken;
  return session;
},

  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export default handler;
