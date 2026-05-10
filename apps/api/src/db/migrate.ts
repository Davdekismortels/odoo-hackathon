import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.js";

console.log("🗄️  Running Drizzle migrations...\n");

try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations applied successfully!");
  process.exit(0);
} catch (err) {
  console.error("❌ Migration failed", err);
  process.exit(1);
}

