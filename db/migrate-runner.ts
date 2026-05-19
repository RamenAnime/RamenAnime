import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { applyLegacySchemaSync } from "./migrations/legacy-schema-sync";

export type MigrationResult = {
  applied: string[];
  skipped: string[];
  errors: string[];
};

type MigrationStep = {
  id: string;
  description: string;
  run: (db: ReturnType<typeof getDb>) => Promise<void>;
};

const MIGRATION_STEPS: MigrationStep[] = [
  {
    id: "legacy-schema-sync-v1",
    description: "Forum, marketplace, users, core tables, analytics, indexes",
    run: applyLegacySchemaSync,
  },
];

async function ensureJournalTable(db: ReturnType<typeof getDb>): Promise<void> {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS schema_migrations (
    id VARCHAR(64) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
}

async function getAppliedIds(db: ReturnType<typeof getDb>): Promise<Set<string>> {
  const rows = await db.execute(sql`SELECT id FROM schema_migrations`);
  const list = Array.isArray(rows) ? rows : (rows as { rows?: { id: string }[] }).rows ?? [];
  return new Set(list.map((r) => String((r as { id: string }).id)));
}

async function recordMigration(
  db: ReturnType<typeof getDb>,
  id: string,
  description: string,
): Promise<void> {
  await db.execute(
    sql`INSERT INTO schema_migrations (id, description) VALUES (${id}, ${description})`,
  );
}

export async function runMigrations(options?: {
  continueOnError?: boolean;
  verbose?: boolean;
}): Promise<MigrationResult> {
  const result: MigrationResult = { applied: [], skipped: [], errors: [] };
  const db = getDb();
  await ensureJournalTable(db);
  const applied = await getAppliedIds(db);

  for (const step of MIGRATION_STEPS) {
    if (applied.has(step.id)) {
      result.skipped.push(step.id);
      if (options?.verbose) {
        console.log(`[migrate] skip ${step.id}`);
      }
      continue;
    }

    try {
      if (options?.verbose) {
        console.log(`[migrate] applying ${step.id}: ${step.description}`);
      }
      await step.run(db);
      await recordMigration(db, step.id, step.description);
      result.applied.push(step.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`${step.id}: ${message}`);
      if (!options?.continueOnError) {
        throw err;
      }
    }
  }

  if (options?.verbose) {
    console.log("[migrate] done", result);
  }

  return result;
}
