import { connection } from "next/server";
import { auth } from "@/auth";

export async function getSession() {
  await connection();
  return auth();
}

export async function requireUser() {
  const session = await getSession();
  const id = session?.user?.id;
  if (!id) return null;
  return {
    id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
  };
}
