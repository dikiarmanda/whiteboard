"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FolderSummary } from "@/lib/folders";

export function FolderSidebar({
  currentFolderId,
  folders: initialFolders,
}: {
  currentFolderId?: string;
  folders: FolderSummary[];
}) {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderSummary[]>(initialFolders);
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setFolders([...folders, data.folder]);
        setNewFolderName("");
        setShowCreate(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className="w-64 shrink-0 border-r pr-6" style={{borderColor: 'var(--color-border)'}}>
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">Folder</h2>
      </div>

      <nav className="space-y-1">
        <Link
          href="/boards"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            !currentFolderId
              ? "bg-primary/10 text-primary"
              : "text-muted hover:bg-ink/5"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Semua board
        </Link>

        {folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/boards?folderId=${folder.id}`}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              currentFolderId === folder.id
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-ink/5"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: folder.color }}
            />
            {folder.name}
          </Link>
        ))}
      </nav>

      {showCreate ? (
        <form onSubmit={createFolder} className="mt-4">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nama folder..."
            className="field mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn text-sm"
              disabled={creating || !newFolderName.trim()}
            >
              {creating ? "Membuat..." : "Buat"}
            </button>
            <button
              type="button"
              className="btn-quiet text-sm"
              onClick={() => {
                setShowCreate(false);
                setNewFolderName("");
              }}
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-ink/5"
          onClick={() => setShowCreate(true)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Folder baru
        </button>
      )}
    </aside>
  );
}
