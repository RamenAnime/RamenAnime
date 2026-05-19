import "dotenv/config";
import { runMigrations } from "../db/migrate-runner";

const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

runMigrations({ verbose, continueOnError: false })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
