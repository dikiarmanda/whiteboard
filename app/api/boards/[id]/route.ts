import { z } from "zod";
import { getBoard, patchBoard, permanentlyDeleteBoard, softDeleteBoard } from "@/lib/boards";
import { sanitizeScene, sceneByteLength, MAX_SCENE_BYTES } from "@/lib/scene";
import { requireUser } from "@/lib/session";
import { titleSchema } from "@/lib/validators";

const patchSchema = z.object({
  version: z.number().int().positive().optional(),
  title: titleSchema.optional(),
  isFavorite: z.boolean().optional(),
  scene: z.unknown().optional(),
});

async function readId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const parsed = z.uuid().safeParse(id);
  return parsed.success ? parsed.data : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const id = await readId(context.params);
  if (!id) return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });

  const board = await getBoard(user.id, id);
  if (!board || board.deletedAt) {
    return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ board });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const id = await readId(context.params);
  if (!id) return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_SCENE_BYTES + 64 * 1024) {
    return Response.json(
      { error: "Board terlalu besar. Ukuran maksimum sekitar 3 MB." },
      { status: 413 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Data board tidak valid." }, { status: 400 });
  }

  let scene;
  if (parsed.data.scene !== undefined) {
    scene = sanitizeScene(parsed.data.scene);
    if (!scene || sceneByteLength(scene) > MAX_SCENE_BYTES) {
      return Response.json(
        { error: "Board terlalu besar. Ukuran maksimum sekitar 3 MB." },
        { status: 413 },
      );
    }
  }

  const result = await patchBoard(user.id, id, {
    version: parsed.data.version,
    title: parsed.data.title,
    isFavorite: parsed.data.isFavorite,
    scene: scene ?? undefined,
  });

  if (result.error === "too-large") {
    return Response.json(
      { error: "Board terlalu besar. Ukuran maksimum sekitar 3 MB." },
      { status: 413 },
    );
  }
  if (result.error === "empty" || result.error === "version") {
    return Response.json({ error: "Data board tidak valid." }, { status: 400 });
  }
  if (result.error === "missing") {
    return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  }
  if (result.error === "deleted") {
    return Response.json(
      { error: "Board ini ada di tempat sampah.", deleted: true },
      { status: 409 },
    );
  }
  if (result.error === "conflict") {
    return Response.json(
      {
        error: "Board ini diperbarui di tempat lain.",
        board: result.board,
      },
      { status: 409 },
    );
  }

  return Response.json({ board: result.board });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const id = await readId(context.params);
  if (!id) return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });

  const permanent = new URL(request.url).searchParams.get("permanent") === "1";
  const ok = permanent
    ? await permanentlyDeleteBoard(user.id, id)
    : await softDeleteBoard(user.id, id);

  if (!ok) return Response.json({ error: "Board tidak ditemukan." }, { status: 404 });
  return Response.json({ ok: true });
}
