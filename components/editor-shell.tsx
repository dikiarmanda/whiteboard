"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BoardScene } from "@/lib/scene";

const Canvas = dynamic(() => import("@/components/excalidraw-canvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-muted">Menyiapkan papan…</div>
  ),
});

type Props = {
  id: string;
  title: string;
  version: number;
  scene: BoardScene;
};

type Status = "saving" | "saved" | "error";

type ServerCopy = {
  title: string;
  version: number;
  scene: BoardScene;
};

type Draft = ServerCopy & { baseVersion: number };

const labels: Record<Status, string> = {
  saving: "Menyimpan…",
  saved: "Tersimpan",
  error: "Gagal menyimpan",
};

function draftKey(id: string) {
  return `papan:draft:${id}`;
}

function readDraft(id: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed?.scene || typeof parsed.baseVersion !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(id: string, draft: Draft) {
  try {
    localStorage.setItem(draftKey(id), JSON.stringify(draft));
  } catch {
    // Simpanan lokal bisa gagal jika kuota penuh. Simpanan server tetap dicoba.
  }
}

function clearDraft(id: string) {
  localStorage.removeItem(draftKey(id));
}

type Boot = {
  scene: BoardScene;
  title: string;
  conflict: boolean;
  dirty: boolean;
};

function bootEditor(props: Props): Boot {
  const draft = readDraft(props.id);
  if (draft && draft.baseVersion !== props.version) {
    return { scene: props.scene, title: props.title, conflict: true, dirty: false };
  }
  if (
    draft &&
    (draft.title !== props.title || JSON.stringify(draft.scene) !== JSON.stringify(props.scene))
  ) {
    return { scene: draft.scene, title: draft.title, conflict: false, dirty: true };
  }
  if (draft) clearDraft(props.id);
  return { scene: props.scene, title: props.title, conflict: false, dirty: false };
}

export function EditorShell(props: Props) {
  const [boot] = useState(() => bootEditor(props));
  const [title, setTitle] = useState(boot.title);
  const [scene, setScene] = useState(boot.scene);
  const [status, setStatus] = useState<Status>(boot.dirty ? "saving" : "saved");
  const [note, setNote] = useState("");
  const [conflict, setConflict] = useState(boot.conflict);
  const [deleted, setDeleted] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [pendingServer, setPendingServer] = useState<ServerCopy | null>(
    boot.conflict ? { title: props.title, version: props.version, scene: props.scene } : null,
  );

  const sceneRef = useRef(boot.scene);
  const titleRef = useRef(boot.title);
  const versionRef = useRef(props.version);
  const dirtyRef = useRef(boot.dirty);
  const conflictRef = useRef(boot.conflict);
  const editGen = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);
  const armed = useRef(false);
  const flushRef = useRef<() => Promise<void>>(async () => {});

  function schedule() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flushRef.current();
    }, 2000);
  }

  function markDirty(nextScene: BoardScene, nextTitle: string) {
    sceneRef.current = nextScene;
    titleRef.current = nextTitle;
    dirtyRef.current = true;
    editGen.current += 1;
    setStatus("saving");
    setNote("");
    writeDraft(props.id, {
      baseVersion: versionRef.current,
      title: nextTitle,
      scene: nextScene,
      version: versionRef.current,
    });
    schedule();
  }

  async function flush() {
    if (conflictRef.current || !dirtyRef.current || saving.current) return;
    const nextTitle = titleRef.current.trim();
    if (!nextTitle) {
      setStatus("error");
      setNote("Judul tidak boleh kosong.");
      return;
    }
    saving.current = true;
    const generation = editGen.current;
    const payload = {
      version: versionRef.current,
      title: nextTitle,
      scene: sceneRef.current,
    };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`/api/boards/${props.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          dirtyRef.current = false;
          if (data.deleted) {
            setDeleted(true);
          } else if (data.board) {
            conflictRef.current = true;
            setConflict(true);
            setPendingServer({
              title: data.board.title,
              version: data.board.version,
              scene: data.board.scene,
            });
          }
          setStatus("saved");
          saving.current = false;
          return;
        }
        if (response.status === 413) {
          setStatus("error");
          setNote("Board terlalu besar. Ukuran maksimum sekitar 3 MB.");
          saving.current = false;
          return;
        }
        if (!response.ok) throw new Error("save");

        versionRef.current = data.board.version;
        if (editGen.current === generation) {
          dirtyRef.current = false;
          clearDraft(props.id);
          setStatus("saved");
        }
        saving.current = false;
        if (editGen.current !== generation) schedule();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }

    setStatus("error");
    saving.current = false;
  }

  useEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    if (dirtyRef.current && !conflictRef.current) schedule();
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const onOnline = () => {
      if (dirtyRef.current) void flushRef.current();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden" && dirtyRef.current) void flushRef.current();
    };
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onScene(next: BoardScene) {
    if (conflictRef.current || deleted) return;
    if (!armed.current) {
      armed.current = true;
      if (
        JSON.stringify(next.elements) === JSON.stringify(sceneRef.current.elements) &&
        JSON.stringify(next.files) === JSON.stringify(sceneRef.current.files)
      ) {
        sceneRef.current = next;
        return;
      }
    }
    if (JSON.stringify(next) === JSON.stringify(sceneRef.current) && titleRef.current === title) {
      return;
    }
    markDirty(next, titleRef.current);
  }

  function applyServer() {
    if (!pendingServer) return;
    sceneRef.current = pendingServer.scene;
    titleRef.current = pendingServer.title;
    versionRef.current = pendingServer.version;
    dirtyRef.current = false;
    conflictRef.current = false;
    clearDraft(props.id);
    setScene(pendingServer.scene);
    setTitle(pendingServer.title);
    setConflict(false);
    setPendingServer(null);
    setStatus("saved");
    setCanvasKey((value) => value + 1);
    armed.current = false;
  }

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="studio flex shrink-0 flex-wrap items-center gap-3 bg-studio px-4 py-2 text-paper">
        <Link href="/boards" className="nav-link">
          Semua board
        </Link>
        <input
          className="field max-w-md font-display text-lg"
          value={title}
          aria-label="Judul board"
          disabled={conflict || deleted}
          onChange={(event) => {
            const next = event.target.value;
            setTitle(next);
            titleRef.current = next;
            markDirty(sceneRef.current, next);
          }}
        />
        <p className={`status ${status}`} aria-live="polite">
          {labels[status]}
          {note ? ` ${note}` : ""}
        </p>
        {status === "error" ? (
          <button type="button" className="btn-quiet min-h-10 px-3 text-sm" onClick={() => void flush()}>
            Coba lagi
          </button>
        ) : null}
      </header>
      <div className="min-h-0 flex-1">
        <Canvas key={canvasKey} scene={scene} onScene={onScene} />
      </div>
      {conflict && pendingServer ? (
        <div className="fixed inset-0 grid place-items-center bg-studio/70 px-4" role="dialog" aria-modal="true">
          <div className="panel max-w-md py-6 pr-6">
            <h2 className="font-display text-2xl tracking-tight">Board sudah diperbarui</h2>
            <p className="mt-3 text-muted">
              Perubahan di tab ini tidak akan disimpan. Muat data terbaru dari server.
            </p>
            <button type="button" className="btn mt-6" onClick={applyServer}>
              Muat data terbaru
            </button>
          </div>
        </div>
      ) : null}
      {deleted ? (
        <div className="fixed inset-0 grid place-items-center bg-studio/70 px-4" role="dialog" aria-modal="true">
          <div className="panel max-w-md py-6 pr-6">
            <h2 className="font-display text-2xl tracking-tight">Board ada di tempat sampah</h2>
            <p className="mt-3 text-muted">Perubahan di tab ini tidak disimpan.</p>
            <Link href="/boards/trash" className="btn mt-6">
              Buka tempat sampah
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
