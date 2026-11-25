import { createFolder, listFolders } from "@/lib/folders";
import { requireUser } from "@/lib/session";
import { titleSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  const folders = await listFolders(user.id);
  return Response.json({ folders });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Masuk dulu untuk melanjutkan." }, { status: 401 });
  }

  let name = "Folder baru";
  let color = "#7C3AED";
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

  const result = await createFolder(user.id, name, color);
  if (result.error) {
    return Response.json({ error: "Folder gagal dibuat." }, { status: 500 });
  }
  return Response.json({ folder: result.folder }, { status: 201 });
}
