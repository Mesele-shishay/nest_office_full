import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOfficeLocationToIds1760820000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if old location code columns exist and drop them if they do
    const countryCodeExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'offices' AND column_name = 'countryCode'
    `);

    if (countryCodeExists.length > 0) {
      await queryRunner.query(`
              ALTER TABLE "offices" 
              DROP COLUMN "countryCode",
              DROP COLUMN "stateCode",
              DROP COLUMN "cityCode"
          `);
    }

    // Check if new location ID columns exist, add them if they don't
    const countryIdExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'offices' AND column_name = 'countryId'
    `);

    if (countryIdExists.length === 0) {
      await queryRunner.query(`
              ALTER TABLE "offices" 
              ADD COLUMN "countryId" integer NOT NULL DEFAULT 0,
              ADD COLUMN "stateId" integer NOT NULL DEFAULT 0,
              ADD COLUMN "cityId" integer NOT NULL DEFAULT 0
          `);
    }

    // Note: You may need to manually update existing records with valid IDs
    // before removing the DEFAULT constraint
    // After populating the data, you can run:
    // ALTER TABLE "offices" ALTER COLUMN "countryId" DROP DEFAULT;
    // ALTER TABLE "offices" ALTER COLUMN "stateId" DROP DEFAULT;
    // ALTER TABLE "offices" ALTER COLUMN "cityId" DROP DEFAULT;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new location ID columns
    await queryRunner.query(`
            ALTER TABLE "offices" 
            DROP COLUMN "countryId",
            DROP COLUMN "stateId",
            DROP COLUMN "cityId"
        `);

    // Restore the old location code columns
    await queryRunner.query(`
            ALTER TABLE "offices" 
            ADD COLUMN "countryCode" character varying(2) NOT NULL DEFAULT '',
            ADD COLUMN "stateCode" character varying(10) NOT NULL DEFAULT '',
            ADD COLUMN "cityCode" character varying(20) NOT NULL DEFAULT ''
        `);

    // Note: Data will be lost during rollback
    // You'll need to manually restore data from backups if needed
  }
}
