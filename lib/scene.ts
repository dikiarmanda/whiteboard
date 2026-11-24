export const SCENE_SCHEMA_VERSION = 1 as const;
export const MAX_SCENE_BYTES = 3 * 1024 * 1024;
export const MAX_BOARDS = 200;
export const PAGE_SIZE = 24;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_PER_EMAIL = 10;
export const LOGIN_MAX_PER_IP = 30;
export const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;

export type BoardScene = {
  schemaVersion: typeof SCENE_SCHEMA_VERSION;
  elements: Record<string, unknown>[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
};

const EPHEMERAL_APP_STATE = new Set([
  "collaborators",
  "cursorButton",
  "editingGroupId",
  "selectedElementIds",
  "selectedGroupIds",
  "selectedLinearElement",
  "editingLinearElement",
  "editingTextElement",
  "multiElement",
  "newElement",
  "resizingElement",
  "selectionElement",
  "draggingElement",
  "suggestedBindings",
  "startBoundElement",
  "frameToHighlight",
  "elementsToHighlight",
  "pendingImageElementId",
  "showHyperlinkPopup",
  "openMenu",
  "openPopup",
  "openSidebar",
  "openDialog",
  "toast",
  "errorMessage",
  "isLoading",
  "activeEmbeddable",
  "snapLines",
  "originSnapOffset",
  "followedBy",
  "userToFollow",
  "isCropping",
  "croppingElementId",
  "offsetLeft",
  "offsetTop",
  "width",
  "height",
  "scrolledOutside",
  "activeTool",
  "penMode",
  "penDetected",
]);

export function emptyScene(): BoardScene {
  return {
    schemaVersion: SCENE_SCHEMA_VERSION,
    elements: [],
    appState: { viewBackgroundColor: "#ffffff" },
    files: {},
  };
}

export function sceneByteLength(scene: BoardScene) {
  return new TextEncoder().encode(JSON.stringify(scene)).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeScene(input: unknown): BoardScene | null {
  if (!isRecord(input)) return null;
  if (!Array.isArray(input.elements)) return null;
  if (!input.elements.every((element) => isRecord(element))) return null;

  const appState: Record<string, unknown> = {};
  if (isRecord(input.appState)) {
    for (const [key, value] of Object.entries(input.appState)) {
      if (!EPHEMERAL_APP_STATE.has(key)) {
        appState[key] = value;
      }
    }
  }

  const files = isRecord(input.files) ? input.files : {};

  return {
    schemaVersion: SCENE_SCHEMA_VERSION,
    elements: input.elements,
    appState,
    files,
  };
}
