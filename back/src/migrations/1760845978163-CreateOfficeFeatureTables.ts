import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfficeFeatureTables1760845978163
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if features table already exists
    const featuresTableExists = await queryRunner.hasTable('features');
    const officeFeaturesTableExists =
      await queryRunner.hasTable('office_features');

    // Create features table if it doesn't exist
    if (!featuresTableExists) {
      await queryRunner.query(`
            CREATE TABLE "features" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "tokenName" character varying NOT NULL,
                "isPaid" boolean NOT NULL DEFAULT false,
                "isDefault" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_features" PRIMARY KEY ("id")
            )
        `);

      // Create unique constraints for features table
      await queryRunner.query(`
            ALTER TABLE "features" 
            ADD CONSTRAINT "UQ_features_name" UNIQUE ("name")
        `);

      await queryRunner.query(`
            ALTER TABLE "features" 
            ADD CONSTRAINT "UQ_features_tokenName" UNIQUE ("tokenName")
        `);
    }

    // Create office_features table if it doesn't exist
    if (!officeFeaturesTableExists) {
      await queryRunner.query(`
            CREATE TABLE "office_features" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "officeId" uuid NOT NULL,
                "featureId" uuid NOT NULL,
                "isEnabled" boolean NOT NULL DEFAULT false,
                "verifiedToken" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_office_features" PRIMARY KEY ("id")
            )
        `);

      // Create unique constraint for office_features table (one feature per office)
      await queryRunner.query(`
            ALTER TABLE "office_features" 
            ADD CONSTRAINT "UQ_office_features_office_feature" UNIQUE ("officeId", "featureId")
        `);

      // Create foreign key constraints
      await queryRunner.query(`
            ALTER TABLE "office_features" 
            ADD CONSTRAINT "FK_office_features_office" 
            FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

      await queryRunner.query(`
            ALTER TABLE "office_features" 
            ADD CONSTRAINT "FK_office_features_feature" 
            FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

      // Create indexes for better performance
      await queryRunner.query(`
            CREATE INDEX "IDX_office_features_officeId" ON "office_features" ("officeId")
        `);

      await queryRunner.query(`
            CREATE INDEX "IDX_office_features_featureId" ON "office_features" ("featureId")
        `);

      await queryRunner.query(`
            CREATE INDEX "IDX_office_features_isEnabled" ON "office_features" ("isEnabled")
        `);

      await queryRunner.query(`
            CREATE INDEX "IDX_features_isDefault" ON "features" ("isDefault")
        `);

      await queryRunner.query(`
            CREATE INDEX "IDX_features_isPaid" ON "features" ("isPaid")
        `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_features_isPaid"`);
    await queryRunner.query(`DROP INDEX "IDX_features_isDefault"`);
    await queryRunner.query(`DROP INDEX "IDX_office_features_isEnabled"`);
    await queryRunner.query(`DROP INDEX "IDX_office_features_featureId"`);
    await queryRunner.query(`DROP INDEX "IDX_office_features_officeId"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "office_features" DROP CONSTRAINT "FK_office_features_feature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_features" DROP CONSTRAINT "FK_office_features_office"`,
    );

    // Drop unique constraints
    await queryRunner.query(
      `ALTER TABLE "office_features" DROP CONSTRAINT "UQ_office_features_office_feature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "features" DROP CONSTRAINT "UQ_features_tokenName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "features" DROP CONSTRAINT "UQ_features_name"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "office_features"`);
    await queryRunner.query(`DROP TABLE "features"`);
  }
}
