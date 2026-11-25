import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { BoardCard } from "@/components/board-card";
import { BoardToolbar, Pager } from "@/components/board-toolbar";
import { listBoards } from "@/lib/boards";
import { formatWaktu } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/scene";
import { requireUser } from "@/lib/session";
import { parseListSearchParams } from "@/lib/validators";

async function TrashContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const query = parseListSearchParams(await searchParams, true);
  const result = await listBoards(user.id, { ...query, favorite: false, trash: true });

  return (
    <>
      <AppHeader name={user.name || user.email || "Pengguna"} current="trash" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Tempat sampah</h1>
        <p className="mt-3 max-w-xl text-muted">
          Board di sini bisa dipulihkan. Setelah 30 hari, board dihapus permanen.
        </p>
        <div className="mt-8">
          <BoardToolbar query={{ ...query, favorite: false }} base="/boards/trash" showFavorite={false} />
        </div>
        {result.total === 0 ? (
          <div className="panel mt-8 py-12 pr-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{backgroundColor: 'rgb(124 58 237 / 0.1)'}}>
                <svg className="h-10 w-10" style={{color: 'var(--color-primary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="font-display text-2xl tracking-tight">
                {query.q ? "Tidak ada yang cocok" : "Tempat sampah kosong"}
              </p>
              <p className="mt-3 max-w-md text-muted">
                {query.q
                  ? "Coba judul lain, atau tampilkan semua board di sampah."
                  : "Board yang dihapus akan muncul di sini."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {result.boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                mode="trash"
                editedLabel={`Dihapus ${formatWaktu(new Date(board.updatedAt))}`}
              />
            ))}
          </div>
        )}
        <Pager
          base="/boards/trash"
          query={{ ...query, favorite: false, trash: true }}
          total={result.total}
          pageSize={PAGE_SIZE}
        />
      </main>
    </>
  );
}

export default function TrashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-muted">Memuat tempat sampah…</p>}>
      <TrashContent searchParams={searchParams} />
    </Suspense>
  );
}
