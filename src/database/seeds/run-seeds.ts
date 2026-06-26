import "reflect-metadata";
import "dotenv/config";
import { dataSource } from "../../config/data-source";
import { runSeeds } from "./index";

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    const migrations = await dataSource.runMigrations();
    if (migrations.length > 0) {
      console.log(`Applied ${migrations.length} migration(s)`);
    }

    await runSeeds(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
