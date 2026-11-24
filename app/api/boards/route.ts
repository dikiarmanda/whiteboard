import { createBoard, listBoards } from "@/lib/boards";
import { requireUser } from "@/lib/session";
import { titleSchema, parseListSearchParams } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const query = parseListSearchParams(new URL(request.url).searchParams);
  const result = await listBoards(user.id, query);
  return Response.json(result);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  let title = "Board tanpa judul";
  const raw = await request.text();
  if (raw) {
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Data tidak valid." }, { status: 400 });
    }
    if (body && typeof body === "object" && "title" in body) {
      const parsed = titleSchema.safeParse(body.title);
      if (!parsed.success) {
        return Response.json({ error: "Judul board tidak valid." }, { status: 400 });
      }
      title = parsed.data;
    }
  }

  const result = await createBoard(user.id, title);
  if (result.error === "limit") {
    return Response.json({ error: "Jumlah board sudah mencapai batas 200." }, { status: 403 });
  }
  if (result.error) {
    return Response.json({ error: "Board gagal dibuat." }, { status: 500 });
  }
  return Response.json({ board: result.board }, { status: 201 });
}
