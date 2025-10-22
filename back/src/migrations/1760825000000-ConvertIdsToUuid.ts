import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertIdsToUuid1760825000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the conversion has already been done by checking if offices.id is UUID
    const officesIdType = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'offices' AND column_name = 'id'
    `);

    if (officesIdType.length > 0 && officesIdType[0].data_type === 'uuid') {
      // Conversion already done, skip
      return;
    }

    // Enable uuid-ossp extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Step 1: Add temporary UUID columns for foreign keys
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "officeId_uuid" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "offices" 
      ADD COLUMN "officeTypeId_uuid" uuid
    `);

    // Step 2: Add temporary UUID columns for primary keys
    await queryRunner.query(`
      ALTER TABLE "office_types" 
      ADD COLUMN "id_uuid" uuid DEFAULT uuid_generate_v4()
    `);

    await queryRunner.query(`
      ALTER TABLE "offices" 
      ADD COLUMN "id_uuid" uuid DEFAULT uuid_generate_v4()
    `);

    // Step 3: Update foreign key references to use UUIDs
    // Update officeTypeId in offices table
    await queryRunner.query(`
      UPDATE "offices" o
      SET "officeTypeId_uuid" = ot."id_uuid"
      FROM "office_types" ot
      WHERE o."officeTypeId" = ot."id"
    `);

    // Update officeId in users table
    await queryRunner.query(`
      UPDATE "users" u
      SET "officeId_uuid" = o."id_uuid"
      FROM "offices" o
      WHERE u."officeId" = o."id"
    `);

    // Step 4: Drop old foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_f7f69295d570c80f210703300f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" DROP CONSTRAINT IF EXISTS "FK_5f5dcebd7d79eebd4d652f251a8"`,
    );

    // Step 5: Drop old primary key constraints
    await queryRunner.query(
      `ALTER TABLE "offices" DROP CONSTRAINT IF EXISTS "PK_offices"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_types" DROP CONSTRAINT IF EXISTS "PK_office_types"`,
    );

    // Step 6: Drop old columns
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "officeId"`);
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN "officeTypeId"`);
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "office_types" DROP COLUMN "id"`);

    // Step 7: Rename UUID columns to original names
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "officeId_uuid" TO "officeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" RENAME COLUMN "officeTypeId_uuid" TO "officeTypeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" RENAME COLUMN "id_uuid" TO "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_types" RENAME COLUMN "id_uuid" TO "id"`,
    );

    // Step 8: Make UUID columns NOT NULL where appropriate
    await queryRunner.query(
      `ALTER TABLE "offices" ALTER COLUMN "officeTypeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" ALTER COLUMN "id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_types" ALTER COLUMN "id" SET NOT NULL`,
    );

    // Step 9: Add new primary key constraints
    await queryRunner.query(
      `ALTER TABLE "office_types" ADD CONSTRAINT "PK_office_types" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" ADD CONSTRAINT "PK_offices" PRIMARY KEY ("id")`,
    );

    // Step 10: Add new foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "offices" 
      ADD CONSTRAINT "FK_offices_officeTypeId" 
      FOREIGN KEY ("officeTypeId") 
      REFERENCES "office_types"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_officeId" 
      FOREIGN KEY ("officeId") 
      REFERENCES "offices"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Step 11: Remove default uuid_generate_v4() from columns (TypeORM will handle it)
    await queryRunner.query(
      `ALTER TABLE "office_types" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" ALTER COLUMN "id" DROP DEFAULT`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This is a destructive migration that cannot be fully reversed
    // You would lose the UUID values and need to recreate integer sequences
    throw new Error(
      'This migration cannot be reversed. Please restore from backup if you need to rollback.',
    );
  }
}
