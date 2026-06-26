import "dotenv/config";
import { DataSource } from "typeorm";
import { requireEnv } from "../common/utils/require-env";
import { Project } from "../projects/models/project.entity";
import { Task } from "../tasks/models/task.entity";
import { User } from "../users/models/user.entity";

export const dataSource = new DataSource({
  type: "postgres",
  host: requireEnv(
    "DB_HOST",
    "Missing environment variable: DB_HOST. Copy .env.example to .env and set the required values.",
  ),
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: requireEnv("DB_USERNAME"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  entities: [User, Project, Task],
  migrations: [`${__dirname}/../database/migrations/*.{ts,js}`],
  synchronize: false,
});
