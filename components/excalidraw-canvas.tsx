"use client";

import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { SCENE_SCHEMA_VERSION, type BoardScene } from "@/lib/scene";

type CanvasProps = {
  scene: BoardScene;
  onScene: (scene: BoardScene) => void;
};

export default function ExcalidrawCanvas({ scene, onScene }: CanvasProps) {
  return (
    <div className="excalidraw-host h-full">
      <Excalidraw
        langCode="id-ID"
        initialData={{
          elements: scene.elements as never,
          appState: scene.appState as never,
          files: scene.files as never,
        }}
        onChange={(elements, appState, files) => {
          const raw = JSON.parse(serializeAsJSON(elements, appState, files, "database")) as {
            elements?: Record<string, unknown>[];
            appState?: Record<string, unknown>;
            files?: Record<string, unknown>;
          };
          onScene({
            schemaVersion: SCENE_SCHEMA_VERSION,
            elements: raw.elements ?? [],
            appState: raw.appState ?? {},
            files: raw.files ?? {},
          });
        }}
      />
    </div>
  );
}
