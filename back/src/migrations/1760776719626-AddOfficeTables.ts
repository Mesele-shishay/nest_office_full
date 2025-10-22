import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfficeTables1760776719626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if office_types table exists, create if not
    const officeTypesExists = await queryRunner.hasTable('office_types');
    if (!officeTypesExists) {
      await queryRunner.query(`
              CREATE TABLE "office_types" (
                  "id" SERIAL NOT NULL,
                  "name" character varying NOT NULL,
                  "description" character varying,
                  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                  CONSTRAINT "UQ_office_types_name" UNIQUE ("name"),
                  CONSTRAINT "PK_office_types" PRIMARY KEY ("id")
              )
          `);
    }

    // Check if offices table exists, create if not
    const officesExists = await queryRunner.hasTable('offices');
    if (!officesExists) {
      await queryRunner.query(`
              CREATE TABLE "offices" (
                  "id" SERIAL NOT NULL,
                  "name" character varying NOT NULL,
                  "image" character varying,
                  "status" character varying NOT NULL DEFAULT 'ACTIVE',
                  "qrCode" character varying,
                  "officeTypeId" integer NOT NULL,
                  "latitude" numeric(10,8),
                  "longitude" numeric(11,8),
                  "countryCode" character varying(2) NOT NULL,
                  "stateCode" character varying(10) NOT NULL,
                  "cityCode" character varying(20) NOT NULL,
                  "createdBy" character varying NOT NULL,
                  "updatedBy" character varying,
                  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "deletedAt" TIMESTAMP,
                  CONSTRAINT "PK_offices" PRIMARY KEY ("id")
              )
          `);
    }

    // Add foreign key constraint for officeTypeId if it doesn't exist
    const fkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'FK_offices_officeTypeId' 
      AND table_name = 'offices'
    `);

    if (fkExists.length === 0) {
      await queryRunner.query(`
              ALTER TABLE "offices" 
              ADD CONSTRAINT "FK_offices_officeTypeId" 
              FOREIGN KEY ("officeTypeId") 
              REFERENCES "office_types"("id") 
              ON DELETE NO ACTION ON UPDATE NO ACTION
          `);
    }

    // Note: createdBy and updatedBy are stored as strings (user emails/identifiers)
    // They are not foreign keys to the users table

    // Add officeId column to users table if it doesn't exist
    const officeIdColumnExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'officeId'
    `);

    if (officeIdColumnExists.length === 0) {
      await queryRunner.query(`
              ALTER TABLE "users" 
              ADD COLUMN "officeId" integer
          `);
    }

    // Add foreign key constraint for officeId in users table if it doesn't exist
    const userFkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'FK_users_officeId' 
      AND table_name = 'users'
    `);

    if (userFkExists.length === 0) {
      await queryRunner.query(`
              ALTER TABLE "users" 
              ADD CONSTRAINT "FK_users_officeId" 
              FOREIGN KEY ("officeId") 
              REFERENCES "offices"("id") 
              ON DELETE SET NULL ON UPDATE NO ACTION
          `);
    }

    // Update UserRole enum to include MANAGER if it doesn't exist
    const managerExists = await queryRunner.query(`
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'users_role_enum' AND e.enumlabel = 'MANAGER'
    `);

    if (managerExists.length === 0) {
      await queryRunner.query(`
              ALTER TYPE "public"."users_role_enum" 
              ADD VALUE 'MANAGER'
          `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_officeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" DROP CONSTRAINT "FK_offices_officeTypeId"`,
    );

    // Remove officeId column from users table
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "officeId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "offices"`);
    await queryRunner.query(`DROP TABLE "office_types"`);

    // Note: We don't remove the MANAGER value from the enum as it might cause issues
    // If needed, this should be done manually after ensuring no users have MANAGER role
  }
}
