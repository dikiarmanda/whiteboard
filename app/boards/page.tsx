import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { BoardCard } from "@/components/board-card";
import { BoardToolbar, Pager } from "@/components/board-toolbar";
import { NewBoardButton } from "@/components/new-board-button";
import { FolderSidebar } from "@/components/folder-sidebar";
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
      <main className="mx-auto flex max-w-7xl px-4 py-10 sm:px-6">
        <FolderSidebar currentFolderId={query.folderId} userId={user.id} />
        <div className="flex-1 pl-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl tracking-tight">
                {query.folderId ? "Board di folder" : "Semua board"}
              </h1>
              <p className="mt-3 text-muted">
                {result.total === 0
                  ? "Gambar tersimpan otomatis di setiap board."
                  : `${result.total} board. Gambar tersimpan otomatis.`}
              </p>
            </div>
            <NewBoardButton />
          </div>
          <div className="mt-8">
            <BoardToolbar query={query} base="/boards" showFavorite />
          </div>
          {empty ? (
            <div className="panel mt-8 py-12 pr-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{backgroundColor: 'rgb(124 58 237 / 0.1)'}}>
                  <svg className="h-10 w-10" style={{color: 'var(--color-primary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-display text-2xl tracking-tight">
                  {query.q || query.favorite ? "Tidak ada yang cocok" : "Belum ada board"}
                </p>
                <p className="mt-3 max-w-md text-muted">
                  {query.q || query.favorite
                    ? "Coba judul lain, atau tampilkan semua board."
                    : "Buat board pertama untuk mulai menggambar."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
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
