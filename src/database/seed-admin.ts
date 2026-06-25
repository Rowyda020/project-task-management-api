import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { UserRole } from "../users/enums/user-role.enum";
import { User } from "../users/models/user.entity";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getSaltRounds(): number {
  return parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
}

export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  const name = process.env.SEED_ADMIN_NAME || "Admin";

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
