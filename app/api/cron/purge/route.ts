import { and, isNotNull, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { boards, loginAttempts } from "@/db/schema";
import { TRASH_RETENTION_MS } from "@/lib/scene";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const trashCutoff = new Date(Date.now() - TRASH_RETENTION_MS);
  const attemptCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const db = getDb();

  const purged = await db
    .delete(boards)
    .where(and(isNotNull(boards.deletedAt), lt(boards.deletedAt, trashCutoff)))
    .returning({ id: boards.id });

  const cleared = await db
    .delete(loginAttempts)
    .where(lt(loginAttempts.attemptedAt, attemptCutoff))
    .returning({ id: loginAttempts.id });

  return Response.json({
    purgedBoards: purged.length,
    clearedAttempts: cleared.length,
  });
}
