import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { folders } from "@/db/schema";

export type FolderSummary = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type FolderRecord = FolderSummary;

function toSummary(row: {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}): FolderSummary {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFolders(userId: string) {
  const rows = await getDb()
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(asc(folders.createdAt));

  return rows.map(toSummary);
}

export async function getFolder(userId: string, id: string) {
  const rows = await getDb()
    .select()
    .from(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return toSummary(row);
}

export async function createFolder(userId: string, name: string, color: string = "#7C3AED") {
  const rows = await getDb()
    .insert(folders)
    .values({
      userId,
      name,
      color,
    })
    .returning();

  const row = rows[0];
  if (!row) return { error: "failed" as const };
  return { folder: toSummary(row) };
}

export async function updateFolder(userId: string, id: string, name?: string, color?: string) {
  const set: {
    name?: string;
    color?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };
  if (name !== undefined) set.name = name;
  if (color !== undefined) set.color = color;

  const rows = await getDb()
    .update(folders)
    .set(set)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .returning();

  const row = rows[0];
  if (!row) return { error: "missing" as const };
  return { folder: toSummary(row) };
}

export async function deleteFolder(userId: string, id: string) {
  const rows = await getDb()
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .returning({ id: folders.id });
  return rows.length > 0;
}
