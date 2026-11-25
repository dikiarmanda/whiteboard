"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { BoardSummary } from "@/lib/boards";
import type { FolderSummary } from "@/lib/folders";

type BoardSummaryWithFolder = BoardSummary & {
  folderId?: string | null;
  folderName?: string | null;
  folderColor?: string | null;
};

export function BoardCard({
  board,
  mode,
  editedLabel,
}: {
  board: BoardSummaryWithFolder;
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
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [folders, setFolders] = useState<FolderSummary[]>([]);

  useEffect(() => {
    if (showFolderMenu) {
      loadFolders();
    }
  }, [showFolderMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFolderMenu && !(event.target as Element).closest('.folder-menu')) {
        setShowFolderMenu(false);
      }
    };

    if (showFolderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFolderMenu]);

  async function loadFolders() {
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();
      if (response.ok) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  }

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

  async function moveToFolder(folderId: string | null) {
    const data = await send(`/api/boards/${board.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    if (data) {
      setShowFolderMenu(false);
      router.refresh();
    }
  }

  return (
    <article className="board-card group">
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
        {mode === "active" && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm backdrop-blur-md transition-all hover:scale-110"
              style={{backgroundColor: 'rgb(255 255 255 / 0.9)', color: 'var(--color-muted)'}}
              onClick={() => setEditing(true)}
              aria-label="Ubah nama"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <div className="relative">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm backdrop-blur-md transition-all hover:scale-110"
                style={{backgroundColor: 'rgb(255 255 255 / 0.9)', color: 'var(--color-muted)'}}
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                aria-label="Pindah ke folder"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
              {showFolderMenu && (
                <div className="folder-menu absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border bg-white shadow-lg" style={{borderColor: 'var(--color-border)'}}>
                  <div className="p-2">
                    <button
                      type="button"
                      className="w-full rounded px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-ink/5"
                      onClick={() => moveToFolder(null)}
                    >
                      Tanpa folder
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-ink/5"
                        onClick={() => moveToFolder(folder.id)}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm backdrop-blur-md transition-all hover:scale-110"
              style={{backgroundColor: 'rgb(255 255 255 / 0.9)', color: 'var(--color-muted)'}}
              onClick={duplicate}
              disabled={!!pending}
              aria-label="Duplikat"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
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
        {board.folderName && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: board.folderColor || 'var(--color-primary)' }}
            />
            <span className="text-xs font-medium text-muted">{board.folderName}</span>
          </div>
        )}
        <p className="mt-1 text-sm text-muted">{editedLabel}</p>
        {error ? <p className="mt-2 text-sm font-semibold text-danger">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3" style={{borderColor: 'var(--color-border)'}}>
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
