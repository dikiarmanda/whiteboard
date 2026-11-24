import Link from "next/link";
import type { ListQuery } from "@/lib/validators";

export function listHref(base: string, query: ListQuery, page = query.page) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort !== "updated") params.set("sort", query.sort);
  if (query.favorite) params.set("favorite", "1");
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}

const sorts = [
  { id: "updated", label: "Terbaru" },
  { id: "created", label: "Dibuat" },
  { id: "title", label: "A–Z" },
] as const;

export function BoardToolbar({
  query,
  base,
  showFavorite,
}: {
  query: ListQuery;
  base: string;
  showFavorite: boolean;
}) {
  const filtered = Boolean(query.q || query.favorite || query.sort !== "updated");

  return (
    <div className="panel flex flex-col gap-3 py-3 pr-3 sm:flex-row sm:items-center">
      <form action={base} className="flex min-w-0 flex-1 gap-2">
        <input type="hidden" name="sort" value={query.sort} />
        {query.favorite ? <input type="hidden" name="favorite" value="1" /> : null}
        <label className="sr-only" htmlFor={showFavorite ? "cari-board" : "cari-sampah"}>
          Cari judul
        </label>
        <input
          id={showFavorite ? "cari-board" : "cari-sampah"}
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Cari judul board"
          className="field"
        />
        <button type="submit" className="btn shrink-0">
          Cari
        </button>
      </form>
      <div className="flex flex-wrap gap-2" aria-label="Urutkan">
        {sorts.map((sort) => (
          <Link
            key={sort.id}
            href={listHref(base, { ...query, sort: sort.id }, 1)}
            className={query.sort === sort.id ? "chip is-on" : "chip"}
            aria-pressed={query.sort === sort.id}
          >
            {sort.label}
          </Link>
        ))}
        {showFavorite ? (
          <Link
            href={listHref(base, { ...query, favorite: !query.favorite }, 1)}
            className={query.favorite ? "chip is-on" : "chip"}
            aria-pressed={query.favorite}
          >
            Favorit
          </Link>
        ) : null}
        {filtered ? (
          <Link href={base} className="chip">
            Tampilkan semua
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function Pager({
  base,
  query,
  total,
  pageSize,
}: {
  base: string;
  query: ListQuery;
  total: number;
  pageSize: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages < 2) return null;
  return (
    <nav className="mt-8 flex flex-wrap items-center gap-3 text-sm" aria-label="Halaman">
      {query.page > 1 ? (
        <Link href={listHref(base, query, query.page - 1)} className="chip">
          Sebelumnya
        </Link>
      ) : null}
      <span className="text-muted">
        Halaman {query.page} dari {pages}
      </span>
      {query.page < pages ? (
        <Link href={listHref(base, query, query.page + 1)} className="chip">
          Berikutnya
        </Link>
      ) : null}
    </nav>
  );
}
