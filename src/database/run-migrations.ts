import "reflect-metadata";
import "dotenv/config";
import { dataSource } from "../config/data-source";

async function main(): Promise<void> {
  const revert = process.argv.includes("--revert");

  await dataSource.initialize();

  try {
    if (revert) {
      await dataSource.undoLastMigration();
      console.log("Last migration reverted");
    } else {
      const migrations = await dataSource.runMigrations();
      if (migrations.length === 0) {
        console.log("No pending migrations");
      } else {
        console.log(`Ran ${migrations.length} migration(s): ${migrations.map((m) => m.name).join(", ")}`);
      }
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
