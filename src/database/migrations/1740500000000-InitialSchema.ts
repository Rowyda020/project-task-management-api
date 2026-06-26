import { MigrationInterface, QueryRunner } from "typeorm";

async function createEnumIfNotExists(
  queryRunner: QueryRunner,
  name: string,
  values: string[],
): Promise<void> {
  const literals = values.map((value) => `'${value.replace(/'/g, "''")}'`).join(", ");
  await queryRunner.query(`
    DO $$ BEGIN
      CREATE TYPE "public"."${name}" AS ENUM(${literals});
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export class InitialSchema1740500000000 implements MigrationInterface {
  name = "InitialSchema1740500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await createEnumIfNotExists(queryRunner, "projects_status_enum", [
      "in progress",
      "completed",
      "cancelled",
    ]);
    await createEnumIfNotExists(queryRunner, "tasks_priority_enum", ["low", "medium", "high"]);
    await createEnumIfNotExists(queryRunner, "tasks_status_enum", [
      "pending",
      "in progress",
      "done",
    ]);
    await createEnumIfNotExists(queryRunner, "users_role_enum", ["admin", "member"]);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'member',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "status" "public"."projects_status_enum" NOT NULL,
        "userId" uuid,
        CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "status" "public"."tasks_status_enum" NOT NULL,
        "priority" "public"."tasks_priority_enum" NOT NULL,
        "dueDate" TIMESTAMP NOT NULL,
        "projectId" uuid,
        CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "projects"
        ADD CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tasks"
        ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956"
        FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "FK_e08fca67ca8966e6b9914bf2956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_361a53ae58ef7034adc3c06f09f"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum"`);
  }
}
