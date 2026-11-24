import { z } from "zod";
import { duplicateBoard } from "@/lib/boards";
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

  const result = await duplicateBoard(user.id, id);
  if (result.error === "limit") {
    return Response.json({ error: "Jumlah board sudah mencapai batas 200." }, { status: 403 });
  }
  if (result.error) {
    return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ board: result.board }, { status: 201 });
}
