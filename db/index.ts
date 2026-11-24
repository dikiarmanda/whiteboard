import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | undefined;

export function createDb(url = process.env.DATABASE_URL) {
  if (!url) {
    throw new Error("DATABASE_URL belum diisi.");
  }
  return drizzle(neon(url), { schema });
}

export function getDb() {
  if (!cached) {
    cached = createDb();
  }
  return cached;
}
