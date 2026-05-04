import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse URL to add SSL for TiDB Cloud if not present
const url = new URL(connectionString);
if (!url.searchParams.has("ssl")) {
  url.searchParams.set("ssl", "true");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: url.toString(),
  },
});
