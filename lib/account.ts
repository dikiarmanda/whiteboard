import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { findUserByEmail } from "@/lib/users";

export async function findUserById(id: string) {
  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateUserEmail(id: string, email: string) {
  const taken = await findUserByEmail(email);
  if (taken && taken.id !== id) return false;

  try {
    await getDb().update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
  return true;
}

export async function updateUserPassword(id: string, passwordHash: string) {
  await getDb()
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
