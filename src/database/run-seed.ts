import "reflect-metadata";
import "dotenv/config";
import { dataSource } from "../config/data-source";
import { seedAdminUser } from "./seed-admin";

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    await seedAdminUser(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
