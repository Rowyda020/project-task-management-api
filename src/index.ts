import "reflect-metadata";
import "dotenv/config";
import { app } from "./app";
import { dataSource } from "./config/data-source";
import { seedAdminUser } from "./database/seed-admin";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  try {
    await dataSource.initialize();
    console.log("Database connected");

    const migrations = await dataSource.runMigrations();
    if (migrations.length > 0) {
      console.log(`Applied ${migrations.length} migration(s)`);
    }

    if (process.env.SEED_ADMIN === "true") {
      await seedAdminUser(dataSource);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
