import mysql from "mysql2/promise";
import { env } from "./lib/env";

const pool = mysql.createPool({
  uri: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 3,
  connectTimeout: 60000,
});

export const db = {
  execute: async (sql: string, params?: any[]) => {
    const [rows] = await pool.execute(sql, params);
    return rows as any[];
  }
};