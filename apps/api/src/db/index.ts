import Database from "./sqlite-polyfill.js";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || path.join(__dirname, "../../traveloop.db");

// Keep sqlite internal — only expose the Drizzle instance
const sqlite = new Database(dbPath) as any;
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function getRawDb() {
  return sqlite;
}
