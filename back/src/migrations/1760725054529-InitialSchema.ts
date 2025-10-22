import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760725054529 implements MigrationInterface {
  name = 'InitialSchema1760725054529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum already exists
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'users_role_enum'
    `);

    if (enumExists.length === 0) {
      await queryRunner.query(
        `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`,
      );
    }

    // Check if users table already exists
    const tableExists = await queryRunner.hasTable('users');
    if (!tableExists) {
      await queryRunner.query(
        `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "isActive" boolean NOT NULL DEFAULT true, "resetToken" character varying, "resetTokenExpiry" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
