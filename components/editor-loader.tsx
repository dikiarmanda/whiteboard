"use client";

import dynamic from "next/dynamic";
import type { BoardScene } from "@/lib/scene";

const EditorShell = dynamic(
  () => import("@/components/editor-shell").then((mod) => mod.EditorShell),
  {
    ssr: false,
    loading: () => <p className="px-6 py-10 text-muted">Menyiapkan papan…</p>,
  },
);

export function EditorLoader(props: {
  id: string;
  title: string;
  version: number;
  scene: BoardScene;
}) {
  return <EditorShell {...props} />;
}
