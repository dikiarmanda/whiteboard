"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewBoardButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function createBoard() {
    setPending(true);
    setError("");
    const response = await fetch("/api/boards", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(data.error ?? "Board gagal dibuat.");
      return;
    }
    router.push(`/board/${data.board.id}`);
  }

  return (
    <div>
      <button type="button" className="btn" onClick={createBoard} disabled={pending}>
        {pending ? "Membuat…" : "Board baru"}
      </button>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
