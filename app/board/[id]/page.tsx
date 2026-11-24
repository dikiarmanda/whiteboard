import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { EditorLoader } from "@/components/editor-loader";
import { getBoard } from "@/lib/boards";
import { emptyScene, sanitizeScene } from "@/lib/scene";
import { requireUser } from "@/lib/session";

async function EditorContent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const board = await getBoard(user.id, id);
  if (!board) notFound();
  if (board.deletedAt) redirect("/boards/trash");

  return (
    <EditorLoader
      id={board.id}
      title={board.title}
      version={board.version}
      scene={sanitizeScene(board.scene) ?? emptyScene()}
    />
  );
}

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-muted">Membuka board…</p>}>
      <EditorContent params={params} />
    </Suspense>
  );
}
