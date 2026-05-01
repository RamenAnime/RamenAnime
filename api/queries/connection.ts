import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // TiDB Cloud requires SSL — create pool with SSL enabled
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionLimit: 10,
      connectTimeout: 60000,
    });

    instance = drizzle(pool, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
