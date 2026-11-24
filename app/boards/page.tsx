import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { BoardCard } from "@/components/board-card";
import { BoardToolbar, Pager } from "@/components/board-toolbar";
import { NewBoardButton } from "@/components/new-board-button";
import { listBoards } from "@/lib/boards";
import { formatWaktu } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/scene";
import { requireUser } from "@/lib/session";
import { parseListSearchParams } from "@/lib/validators";

async function BoardsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const query = parseListSearchParams(await searchParams, false);
  const result = await listBoards(user.id, query);
  const empty = result.total === 0;

  return (
    <>
      <AppHeader name={user.name || user.email || "Pengguna"} current="boards" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Semua board</h1>
            <p className="mt-2 text-muted">
              {result.total === 0
                ? "Gambar tersimpan otomatis di setiap board."
                : `${result.total} board. Gambar tersimpan otomatis.`}
            </p>
          </div>
          <NewBoardButton />
        </div>
        <div className="mt-6">
          <BoardToolbar query={query} base="/boards" showFavorite />
        </div>
        {empty ? (
          <div className="panel mt-6 py-10 pr-6">
            <p className="font-display text-2xl tracking-tight">
              {query.q || query.favorite ? "Tidak ada yang cocok" : "Belum ada board"}
            </p>
            <p className="mt-2 max-w-md text-muted">
              {query.q || query.favorite
                ? "Coba judul lain, atau tampilkan semua board."
                : "Buat board pertama untuk mulai menggambar."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                mode="active"
                editedLabel={`Diubah ${formatWaktu(new Date(board.updatedAt))}`}
              />
            ))}
          </div>
        )}
        <Pager base="/boards" query={query} total={result.total} pageSize={PAGE_SIZE} />
      </main>
    </>
  );
}

export default function BoardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-muted">Memuat papan…</p>}>
      <BoardsContent searchParams={searchParams} />
    </Suspense>
  );
}
