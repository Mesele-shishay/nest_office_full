import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHierarchicalAdminSystem1761000000000
  implements MigrationInterface
{
  name = 'AddHierarchicalAdminSystem1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new role enum values
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" 
      ADD VALUE 'CITY_ADMIN' AFTER 'ADMIN'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" 
      ADD VALUE 'STATE_ADMIN' AFTER 'CITY_ADMIN'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" 
      ADD VALUE 'COUNTRY_ADMIN' AFTER 'STATE_ADMIN'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" 
      ADD VALUE 'SUPER_ADMIN' AFTER 'COUNTRY_ADMIN'
    `);

    // Add new columns to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "adminScope" text
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "assignedBy" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "assignedAt" TIMESTAMP
    `);

    // Add foreign key constraint for assignedBy
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_assigned_by" 
      FOREIGN KEY ("assignedBy") REFERENCES "users"("id")
    `);

    // Note: We'll handle the ADMIN to SUPER_ADMIN conversion in a separate migration
    // or through application logic to avoid PostgreSQL enum safety issues
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT "FK_users_assigned_by"
    `);

    // Remove columns
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assignedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assignedBy"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "adminScope"`);

    // Note: We'll handle role conversions through application logic

    // Note: PostgreSQL doesn't support removing enum values easily
    // You might need to recreate the enum type if you want to fully rollback
    // This is a simplified rollback that keeps the enum values
  }
}
