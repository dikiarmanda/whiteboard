"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { unstable_update } from "@/auth";
import { clientIp } from "@/lib/format";
import { loginIsLimited, recordLoginAttempt } from "@/lib/rate-limit";
import { BCRYPT_ROUNDS } from "@/lib/scene";
import { requireUser } from "@/lib/session";
import { findUserById, updateUserEmail, updateUserPassword } from "@/lib/account";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validators";

export type AccountState = {
  error: string;
  message: string;
  nonce: number;
};

const initialError = { message: "", nonce: 0 };

type VerifiedUser = {
  id: string;
  email: string;
  passwordHash: string;
};

async function verifyCurrentPassword(
  currentPassword: string,
): Promise<{ error: string } | { user: VerifiedUser }> {
  const sessionUser = await requireUser();
  if (!sessionUser) return { error: "Sesi berakhir. Masuk lagi." };

  const user = await findUserById(sessionUser.id);
  if (!user?.passwordHash) return { error: "Akun tidak ditemukan." };

  const ip = clientIp(await headers());
  if (await loginIsLimited(user.email, ip)) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." };
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    await recordLoginAttempt(user.email, ip);
    return { error: "Kata sandi saat ini salah." };
  }

  return { user: { id: user.id, email: user.email, passwordHash: user.passwordHash } };
}

export async function changeEmailAction(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { ...initialError, error: "Isi email yang valid dan kata sandi saat ini." };
  }

  const checked = await verifyCurrentPassword(parsed.data.currentPassword);
  if ("error" in checked) return { ...initialError, error: checked.error };

  const email = parsed.data.email.toLowerCase();
  if (email === checked.user.email) {
    return { ...initialError, error: "Email baru sama dengan email saat ini." };
  }

  const saved = await updateUserEmail(checked.user.id, email);
  if (!saved) return { ...initialError, error: "Email ini sudah dipakai akun lain." };

  await unstable_update({});
  return { error: "", message: "Email diperbarui.", nonce: Date.now() };
}

export async function changePasswordAction(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ...initialError, error: "Kata sandi baru minimal 8 karakter." };
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { ...initialError, error: "Pengulangan kata sandi tidak sama." };
  }

  const checked = await verifyCurrentPassword(parsed.data.currentPassword);
  if ("error" in checked) return { ...initialError, error: checked.error };

  const same = await bcrypt.compare(parsed.data.password, checked.user.passwordHash);
  if (same) {
    return { ...initialError, error: "Kata sandi baru harus berbeda dari kata sandi saat ini." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  await updateUserPassword(checked.user.id, passwordHash);
  return { error: "", message: "Kata sandi diperbarui.", nonce: Date.now() };
}
