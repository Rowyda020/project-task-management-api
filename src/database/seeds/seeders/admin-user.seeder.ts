import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { requireEnv } from "../../../common/utils/require-env";
import { UserRole } from "../../../users/enums/user-role.enum";
import { User } from "../../../users/models/user.entity";
import { adminUserSeedData } from "../data/admin-user.seed-data";

function getSaltRounds(): number {
  return parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
}

export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const email = requireEnv(adminUserSeedData.envKeys.email);
  const password = requireEnv(adminUserSeedData.envKeys.password);
  const name =
    process.env[adminUserSeedData.envKeys.name] ?? adminUserSeedData.defaultName;

  const userRepository = dataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    console.log(`Seed skipped: admin user already exists (${email})`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, getSaltRounds());
  const admin = userRepository.create({
    name,
    email,
    password: passwordHash,
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  console.log(`Seeded admin user (${email})`);
}
