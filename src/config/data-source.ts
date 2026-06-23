import "dotenv/config";
import { DataSource } from "typeorm";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env and set the required values.`,
    );
  }
  return value;
}

export const dataSource = new DataSource({
  type: "postgres",
  host: requireEnv("DB_HOST"),
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: requireEnv("DB_USERNAME"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
});
