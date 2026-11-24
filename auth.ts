import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { clientIp } from "@/lib/format";
import { clearLoginAttempts, loginIsLimited, recordLoginAttempt } from "@/lib/rate-limit";
import { findUserByEmail } from "@/lib/users";
import { loginSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const ip = clientIp(request?.headers ?? new Headers());
        if (await loginIsLimited(email, ip)) return null;

        await recordLoginAttempt(email, ip);
        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;

        const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!matches) return null;

        await clearLoginAttempts(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      if (trigger === "update" && typeof token.id === "string") {
        const { findUserById } = await import("@/lib/account");
        const record = await findUserById(token.id);
        if (record) {
          token.email = record.email;
          token.name = record.name;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
});
