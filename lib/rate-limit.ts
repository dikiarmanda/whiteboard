import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { loginAttempts } from "@/db/schema";
import { LOGIN_MAX_PER_EMAIL, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS } from "@/lib/scene";

function since() {
  return new Date(Date.now() - LOGIN_WINDOW_MS);
}

export async function loginIsLimited(email: string, ip: string) {
  const db = getDb();
  const windowStart = since();
  const [byEmail, byIp] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.email, email), gte(loginAttempts.attemptedAt, windowStart))),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ip, ip), gte(loginAttempts.attemptedAt, windowStart))),
  ]);

  return (byEmail[0]?.value ?? 0) >= LOGIN_MAX_PER_EMAIL || (byIp[0]?.value ?? 0) >= LOGIN_MAX_PER_IP;
}

export async function recordLoginAttempt(email: string, ip: string) {
  await getDb().insert(loginAttempts).values({ email, ip });
}

export async function clearLoginAttempts(email: string) {
  await getDb().delete(loginAttempts).where(eq(loginAttempts.email, email));
}
