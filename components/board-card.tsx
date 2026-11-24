"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BoardSummary } from "@/lib/boards";

export function BoardCard({
  board,
  mode,
  editedLabel,
}: {
  board: BoardSummary;
  mode: "active" | "trash";
  editedLabel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(board.title);
  const [editing, setEditing] = useState(false);
  const [favorite, setFavorite] = useState(board.isFavorite);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"trash" | "permanent" | null>(null);

  async function send(path: string, init: RequestInit) {
    setError("");
    setPending(path);
    const response = await fetch(path, init);
    const data = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) {
      setError(data.error ?? "Tindakan gagal.");
      return null;
    }
    return data;
  }

  async function saveTitle() {
    const next = title.trim();
    if (!next) {
      setError("Judul tidak boleh kosong.");
      return;
    }
    const data = await send(`/api/boards/${board.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: next, version: board.version }),
    });
    if (!data) return;
    setEditing(false);
    router.refresh();
  }

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    const data = await send(`/api/boards/${board.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });
    if (!data) setFavorite(!next);
    else router.refresh();
  }

  async function duplicate() {
    const data = await send(`/api/boards/${board.id}/duplicate`, { method: "POST" });
    if (data) router.refresh();
  }

  async function moveToTrash() {
    const data = await send(`/api/boards/${board.id}`, { method: "DELETE" });
    if (data) router.refresh();
  }

  async function restore() {
    const data = await send(`/api/boards/${board.id}/restore`, { method: "POST" });
    if (data) router.refresh();
  }

  async function destroy() {
    const data = await send(`/api/boards/${board.id}?permanent=1`, { method: "DELETE" });
    if (data) router.refresh();
  }

  return (
    <article className="board-card">
      <div className="relative">
        {mode === "active" ? (
          <Link
            href={`/board/${board.id}`}
            className="grid-paper block h-40"
            aria-label={`Buka ${board.title}`}
          />
        ) : (
          <div className="grid-paper h-40" />
        )}
        <span className="dogear" aria-hidden="true" />
        {mode === "active" ? (
          <button
            type="button"
            className={`star absolute top-3 left-3 ${favorite ? "is-on" : ""}`}
            aria-pressed={favorite}
            aria-label={favorite ? "Hapus dari favorit" : "Jadikan favorit"}
            onClick={toggleFavorite}
          >
            {favorite ? "★" : "☆"}
          </button>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-4 py-3">
        {editing ? (
          <input
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Judul board"
          />
        ) : mode === "active" ? (
          <Link href={`/board/${board.id}`} className="font-display text-xl leading-tight tracking-tight">
            {board.title}
          </Link>
        ) : (
          <h2 className="font-display text-xl leading-tight tracking-tight">{board.title}</h2>
        )}
        <p className="mt-1 text-sm text-muted">{editedLabel}</p>
        {error ? <p className="mt-2 text-sm font-semibold text-danger">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2">
          {mode === "active" && !editing ? (
            <>
              <button type="button" className="action" onClick={() => setEditing(true)}>
                Ubah nama
              </button>
              <button type="button" className="action" onClick={duplicate} disabled={!!pending}>
                Duplikat
              </button>
              {confirm === "trash" ? (
                <button type="button" className="action action-danger" onClick={moveToTrash}>
                  Pindahkan ke sampah
                </button>
              ) : (
                <button type="button" className="action action-danger" onClick={() => setConfirm("trash")}>
                  Hapus
                </button>
              )}
            </>
          ) : null}
          {editing ? (
            <>
              <button type="button" className="action" onClick={saveTitle}>
                Simpan nama
              </button>
              <button
                type="button"
                className="action"
                onClick={() => {
                  setTitle(board.title);
                  setEditing(false);
                  setError("");
                }}
              >
                Batal
              </button>
            </>
          ) : null}
          {mode === "trash" ? (
            <>
              <button type="button" className="action" onClick={restore} disabled={!!pending}>
                Pulihkan
              </button>
              {confirm === "permanent" ? (
                <button type="button" className="action action-danger" onClick={destroy}>
                  Ya, hapus permanen
                </button>
              ) : (
                <button type="button" className="action action-danger" onClick={() => setConfirm("permanent")}>
                  Hapus permanen
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
