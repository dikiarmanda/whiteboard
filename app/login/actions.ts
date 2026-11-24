"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/auth";
import { clientIp, safeNextPath } from "@/lib/format";
import { loginIsLimited } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export type LoginState = { error: string };

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Isi email dan kata sandi." };
  }

  const email = parsed.data.email.toLowerCase();
  const headerList = await headers();
  if (await loginIsLimited(email, clientIp(headerList))) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: safeNextPath(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error;
  }

  return { error: "" };
}
