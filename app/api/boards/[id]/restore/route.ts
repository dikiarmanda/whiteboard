import { z } from "zod";
import { restoreBoard } from "@/lib/boards";
import { requireUser } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  }

  const ok = await restoreBoard(user.id, id);
  if (!ok) return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  return Response.json({ ok: true });
}
