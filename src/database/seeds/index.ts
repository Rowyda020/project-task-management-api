import { DataSource } from "typeorm";
import { seedAdminUser } from "./seeders/admin-user.seeder";

export { seedAdminUser } from "./seeders/admin-user.seeder";

export async function runSeeds(dataSource: DataSource): Promise<void> {
  await seedAdminUser(dataSource);
}
