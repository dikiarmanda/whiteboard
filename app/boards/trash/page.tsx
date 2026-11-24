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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Tempat sampah</h1>
        <p className="mt-2 max-w-xl text-muted">
          Board di sini bisa dipulihkan. Setelah 30 hari, board dihapus permanen.
        </p>
        <div className="mt-6">
          <BoardToolbar query={{ ...query, favorite: false }} base="/boards/trash" showFavorite={false} />
        </div>
        {result.total === 0 ? (
          <div className="panel mt-6 py-10 pr-6">
            <p className="font-display text-2xl tracking-tight">
              {query.q ? "Tidak ada yang cocok" : "Tempat sampah kosong"}
            </p>
            <p className="mt-2 max-w-md text-muted">
              {query.q
                ? "Coba judul lain, atau tampilkan semua board di sampah."
                : "Board yang dihapus akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
