import Database, { type Database as BetterDB } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || path.join(__dirname, "../../traveloop.db");

// Keep sqlite internal — only expose the Drizzle instance
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Expose raw sqlite only for migrations (not part of public API surface)
export function getRawDb(): BetterDB {
  return sqlite;
}
