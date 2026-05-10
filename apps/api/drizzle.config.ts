import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env.js";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL.replace("file:", ""),
  },
  verbose: true,
  strict: true,
});
