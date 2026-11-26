import {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import { boards, folders } from "@/db/schema";
import {
  emptyScene,
  MAX_BOARDS,
  MAX_SCENE_BYTES,
  PAGE_SIZE,
  sceneByteLength,
  type BoardScene,
} from "@/lib/scene";
import type { ListQuery } from "@/lib/validators";

export type BoardSummary = {
  id: string;
  title: string;
  thumbnail: string | null;
  isFavorite: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  folderId: string | null;
  folderName: string | null;
  folderColor: string | null;
};

export type BoardRecord = BoardSummary & {
  scene: BoardScene;
};

function toSummary(row: {
  id: string;
  title: string;
  thumbnail: string | null;
  isFavorite: boolean;
  version: number;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  folderId: string | null;
  folderName?: string | null;
  folderColor?: string | null;
}): BoardSummary {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail,
    isFavorite: row.isFavorite,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    folderId: row.folderId,
    folderName: row.folderName ?? null,
    folderColor: row.folderColor ?? null,
  };
}

function likePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export async function countBoards(userId: string) {
  const rows = await getDb()
    .select({ value: sql<number>`count(*)::int` })
    .from(boards)
    .where(eq(boards.userId, userId));
  return rows[0]?.value ?? 0;
}

export async function listBoards(userId: string, query: ListQuery) {
  const filters = [eq(boards.userId, userId)];
  filters.push(query.trash ? isNotNull(boards.deletedAt) : isNull(boards.deletedAt));
  if (query.favorite && !query.trash) {
    filters.push(eq(boards.isFavorite, true));
  }
  if (query.q) {
    filters.push(ilike(boards.title, likePattern(query.q)));
  }
  if (query.folderId) {
    filters.push(eq(boards.folderId, query.folderId));
  }

  const where = and(...filters);
  const order =
    query.sort === "title"
      ? asc(sql`lower(${boards.title})`)
      : query.sort === "created"
        ? desc(boards.createdAt)
        : desc(boards.updatedAt);

  const db = getDb();
  const rows = await db
    .select({
      id: boards.id,
      title: boards.title,
      thumbnail: boards.thumbnail,
      isFavorite: boards.isFavorite,
      version: boards.version,
      updatedAt: boards.updatedAt,
      createdAt: boards.createdAt,
      deletedAt: boards.deletedAt,
      folderId: boards.folderId,
      folderName: folders.name,
      folderColor: folders.color,
      total: sql<number>`count(*) over ()::int`,
    })
    .from(boards)
    .leftJoin(folders, eq(boards.folderId, folders.id))
    .where(where)
    .orderBy(order)
    .limit(PAGE_SIZE)
    .offset((query.page - 1) * PAGE_SIZE);

  return {
    boards: rows.map(({ total: _total, ...row }) => toSummary(row)),
    page: query.page,
    pageSize: PAGE_SIZE,
    total: rows[0]?.total ?? 0,
  };
}

export async function getBoard(userId: string, id: string) {
  const rows = await getDb()
    .select()
    .from(boards)
    .where(and(eq(boards.id, id), eq(boards.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    ...toSummary(row),
    scene: row.scene,
  } satisfies BoardRecord;
}

export async function createBoard(userId: string, title = "Board tanpa judul", folderId?: string) {
  const total = await countBoards(userId);
  if (total >= MAX_BOARDS) {
    return { error: "limit" as const };
  }

  const rows = await getDb()
    .insert(boards)
    .values({
      userId,
      title,
      scene: emptyScene(),
      thumbnail: null,
      folderId: folderId || null,
    })
    .returning();

  const row = rows[0];
  if (!row) return { error: "failed" as const };
  return { board: { ...toSummary(row), scene: row.scene } };
}

export function duplicateTitle(title: string) {
  const next = `Salinan ${title}`;
  return next.length > 200 ? next.slice(0, 200) : next;
}

export async function duplicateBoard(userId: string, id: string) {
  const existing = await getBoard(userId, id);
  if (!existing || existing.deletedAt) return { error: "missing" as const };

  const total = await countBoards(userId);
  if (total >= MAX_BOARDS) return { error: "limit" as const };

  const rows = await getDb()
    .insert(boards)
    .values({
      userId,
      title: duplicateTitle(existing.title),
      scene: existing.scene,
      thumbnail: null,
      isFavorite: false,
      version: 1,
    })
    .returning();

  const row = rows[0];
  if (!row) return { error: "failed" as const };
  return { board: toSummary(row) };
}

export type PatchInput = {
  version?: number;
  title?: string;
  isFavorite?: boolean;
  scene?: BoardScene;
  folderId?: string | null;
};

export async function patchBoard(userId: string, id: string, input: PatchInput) {
  const changesContent = input.title !== undefined || input.scene !== undefined;
  const changesFolder = input.folderId !== undefined;
  if (input.scene && sceneByteLength(input.scene) > MAX_SCENE_BYTES) {
    return { error: "too-large" as const };
  }

  const db = getDb();
  const now = new Date();

  if (!changesContent && !changesFolder && input.isFavorite !== undefined) {
    const rows = await db
      .update(boards)
      .set({ isFavorite: input.isFavorite })
      .where(and(eq(boards.id, id), eq(boards.userId, userId), isNull(boards.deletedAt)))
      .returning();
    const row = rows[0];
    if (!row) return { error: "missing" as const };
    return { board: { ...toSummary(row), scene: row.scene } };
  }

  if (!changesContent && changesFolder) {
    const rows = await db
      .update(boards)
      .set({ folderId: input.folderId, updatedAt: now })
      .where(and(eq(boards.id, id), eq(boards.userId, userId), isNull(boards.deletedAt)))
      .returning();
    const row = rows[0];
    if (!row) return { error: "missing" as const };
    return { board: { ...toSummary(row), scene: row.scene } };
  }

  if (!changesContent) return { error: "empty" as const };
  if (input.version === undefined) return { error: "version" as const };

  const set: {
    title?: string;
    scene?: BoardScene;
    isFavorite?: boolean;
    folderId?: string | null;
    version: ReturnType<typeof sql>;
    updatedAt: Date;
  } = {
    version: sql`${boards.version} + 1`,
    updatedAt: now,
  };
  if (input.title !== undefined) set.title = input.title;
  if (input.scene !== undefined) set.scene = input.scene;
  if (input.isFavorite !== undefined) set.isFavorite = input.isFavorite;
  if (input.folderId !== undefined) set.folderId = input.folderId;

  const rows = await db
    .update(boards)
    .set(set)
    .where(
      and(
        eq(boards.id, id),
        eq(boards.userId, userId),
        isNull(boards.deletedAt),
        eq(boards.version, input.version),
      ),
    )
    .returning();

  const row = rows[0];
  if (row) return { board: { ...toSummary(row), scene: row.scene } };

  const current = await getBoard(userId, id);
  if (!current) return { error: "missing" as const };
  if (current.deletedAt) return { error: "deleted" as const, board: current };
  return { error: "conflict" as const, board: current };
}

export async function softDeleteBoard(userId: string, id: string) {
  const rows = await getDb()
    .update(boards)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(boards.id, id), eq(boards.userId, userId), isNull(boards.deletedAt)))
    .returning({ id: boards.id });
  return rows.length > 0;
}

export async function restoreBoard(userId: string, id: string) {
  const rows = await getDb()
    .update(boards)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(boards.id, id), eq(boards.userId, userId), isNotNull(boards.deletedAt)))
    .returning({ id: boards.id });
  return rows.length > 0;
}

export async function permanentlyDeleteBoard(userId: string, id: string) {
  const rows = await getDb()
    .delete(boards)
    .where(and(eq(boards.id, id), eq(boards.userId, userId), isNotNull(boards.deletedAt)))
    .returning({ id: boards.id });
  return rows.length > 0;
}
