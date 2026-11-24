import type { NextAuthConfig } from "next-auth";

const secure = process.env.NODE_ENV === "production";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const needsAuth = pathname.startsWith("/boards") || pathname.startsWith("/board/");
      if (!needsAuth) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
