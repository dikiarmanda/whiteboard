"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function NewBoardButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function createBoard() {
    setPending(true);
    setError("");
    const folderId = searchParams.get("folderId") || undefined;
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(folderId ? { folderId } : {}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Board gagal dibuat.");
        return;
      }
      router.push(`/board/${data.board.id}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn flex items-center gap-2"
        onClick={createBoard}
        disabled={pending}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {pending ? "Membuat…" : "Board baru"}
      </button>
      {error ? <p className="mt-2 text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
