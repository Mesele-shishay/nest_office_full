import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageToOfficeType1760817850957 implements MigrationInterface {
  name = 'AddImageToOfficeType1760817850957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if image column already exists
    const imageColumnExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'office_types' AND column_name = 'image'
    `);

    if (imageColumnExists.length === 0) {
      // Drop foreign key constraints temporarily
      await queryRunner.query(
        `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_officeId"`,
      );
      await queryRunner.query(
        `ALTER TABLE "offices" DROP CONSTRAINT IF EXISTS "FK_offices_officeTypeId"`,
      );

      // Add image column
      await queryRunner.query(
        `ALTER TABLE "office_types" ADD "image" character varying`,
      );

      // Check if columns are already UUID type before setting defaults
      const officeTypesIdType = await queryRunner.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'office_types' AND column_name = 'id'
      `);

      const officesIdType = await queryRunner.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'offices' AND column_name = 'id'
      `);

      // Only set UUID defaults if columns are UUID type
      if (
        officeTypesIdType.length > 0 &&
        officeTypesIdType[0].data_type === 'uuid'
      ) {
        await queryRunner.query(
          `ALTER TABLE "office_types" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
        );
      }

      if (officesIdType.length > 0 && officesIdType[0].data_type === 'uuid') {
        await queryRunner.query(
          `ALTER TABLE "offices" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
        );
      }

      // Re-add foreign key constraints
      await queryRunner.query(
        `ALTER TABLE "users" ADD CONSTRAINT "FK_f7f69295d570c80f210703300f1" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "offices" ADD CONSTRAINT "FK_5f5dcebd7d79eebd4d652f251a8" FOREIGN KEY ("officeTypeId") REFERENCES "office_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offices" DROP CONSTRAINT "FK_5f5dcebd7d79eebd4d652f251a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_f7f69295d570c80f210703300f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_types" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "office_types" DROP COLUMN "image"`);
    await queryRunner.query(
      `ALTER TABLE "offices" ADD CONSTRAINT "FK_offices_officeTypeId" FOREIGN KEY ("officeTypeId") REFERENCES "office_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_officeId" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
