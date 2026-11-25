import { deleteFolder, getFolder, updateFolder } from "@/lib/folders";
import { requireUser } from "@/lib/session";
import { titleSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getFolder(user.id, id);
  if (!existing) {
    return Response.json({ error: "Folder tidak ditemukan." }, { status: 404 });
  }

  let name: string | undefined = undefined;
  let color: string | undefined = undefined;
  const raw = await request.text();
  if (raw) {
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Data tidak valid." }, { status: 400 });
    }
    if (body && typeof body === "object") {
      if ("name" in body) {
        const parsed = titleSchema.safeParse(body.name);
        if (!parsed.success) {
          return Response.json({ error: "Nama folder tidak valid." }, { status: 400 });
        }
        name = parsed.data;
      }
      if ("color" in body && typeof body.color === "string") {
        color = body.color;
      }
    }
  }

  const result = await updateFolder(user.id, id, name, color);
  if (result.error === "missing") {
    return Response.json({ error: "Folder tidak ditemukan." }, { status: 404 });
  }
  if (result.error) {
    return Response.json({ error: "Folder gagal diperbarui." }, { status: 500 });
  }
  return Response.json({ folder: result.folder });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const { id } = await params;
  const success = await deleteFolder(user.id, id);
  if (!success) {
    return Response.json({ error: "Folder tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ success: true });
}
