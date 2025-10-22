import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeatureGroupManagementSystem1760900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update the existing features table to match new structure
    await queryRunner.query(`
      ALTER TABLE "features" 
      DROP COLUMN IF EXISTS "tokenName",
      DROP COLUMN IF EXISTS "isPaid",
      DROP COLUMN IF EXISTS "isDefault"
    `);

    await queryRunner.query(`
      ALTER TABLE "features" 
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true
    `);

    // Create feature_groups table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feature_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "appName" character varying NOT NULL,
        "description" character varying,
        "isPaid" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_feature_groups" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraints for feature_groups table
    await queryRunner.query(`
      ALTER TABLE "feature_groups" 
      ADD CONSTRAINT "UQ_feature_groups_name" UNIQUE ("name")
    `);

    await queryRunner.query(`
      ALTER TABLE "feature_groups" 
      ADD CONSTRAINT "UQ_feature_groups_appName" UNIQUE ("appName")
    `);

    // Create feature_tokens table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feature_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenName" character varying NOT NULL,
        "featureGroupId" uuid NOT NULL,
        "expiresInDays" integer,
        "isActive" boolean NOT NULL DEFAULT true,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_feature_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint for feature_tokens table
    await queryRunner.query(`
      ALTER TABLE "feature_tokens" 
      ADD CONSTRAINT "UQ_feature_tokens_tokenName" UNIQUE ("tokenName")
    `);

    // Create foreign key constraint for feature_tokens
    await queryRunner.query(`
      ALTER TABLE "feature_tokens" 
      ADD CONSTRAINT "FK_feature_tokens_feature_group" 
      FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create office_feature_groups table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "office_feature_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "officeId" uuid NOT NULL,
        "featureGroupId" uuid NOT NULL,
        "tokenId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP,
        "activatedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_office_feature_groups" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint for office_feature_groups table
    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" 
      ADD CONSTRAINT "UQ_office_feature_groups_office_group" UNIQUE ("officeId", "featureGroupId")
    `);

    // Create foreign key constraints for office_feature_groups
    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" 
      ADD CONSTRAINT "FK_office_feature_groups_office" 
      FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" 
      ADD CONSTRAINT "FK_office_feature_groups_feature_group" 
      FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" 
      ADD CONSTRAINT "FK_office_feature_groups_token" 
      FOREIGN KEY ("tokenId") REFERENCES "feature_tokens"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create feature_group_features junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feature_group_features" (
        "featureGroupId" uuid NOT NULL,
        "featureId" uuid NOT NULL,
        CONSTRAINT "PK_feature_group_features" PRIMARY KEY ("featureGroupId", "featureId")
      )
    `);

    // Create foreign key constraints for junction table
    await queryRunner.query(`
      ALTER TABLE "feature_group_features" 
      ADD CONSTRAINT "FK_feature_group_features_feature_group" 
      FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "feature_group_features" 
      ADD CONSTRAINT "FK_feature_group_features_feature" 
      FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_feature_groups_isPaid" ON "feature_groups" ("isPaid")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_feature_tokens_featureGroupId" ON "feature_tokens" ("featureGroupId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_office_feature_groups_officeId" ON "office_feature_groups" ("officeId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_office_feature_groups_featureGroupId" ON "office_feature_groups" ("featureGroupId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_office_feature_groups_isActive" ON "office_feature_groups" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_office_feature_groups_expiresAt" ON "office_feature_groups" ("expiresAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_features_isActive" ON "features" ("isActive")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_features_isActive"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_office_feature_groups_expiresAt"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_office_feature_groups_isActive"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_office_feature_groups_featureGroupId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_office_feature_groups_officeId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_feature_tokens_featureGroupId"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feature_groups_isPaid"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "feature_group_features" DROP CONSTRAINT IF EXISTS "FK_feature_group_features_feature"
    `);
    await queryRunner.query(`
      ALTER TABLE "feature_group_features" DROP CONSTRAINT IF EXISTS "FK_feature_group_features_feature_group"
    `);

    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" DROP CONSTRAINT IF EXISTS "FK_office_feature_groups_token"
    `);
    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" DROP CONSTRAINT IF EXISTS "FK_office_feature_groups_feature_group"
    `);
    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" DROP CONSTRAINT IF EXISTS "FK_office_feature_groups_office"
    `);

    await queryRunner.query(`
      ALTER TABLE "feature_tokens" DROP CONSTRAINT IF EXISTS "FK_feature_tokens_feature_group"
    `);

    // Drop unique constraints
    await queryRunner.query(`
      ALTER TABLE "office_feature_groups" DROP CONSTRAINT IF EXISTS "UQ_office_feature_groups_office_group"
    `);
    await queryRunner.query(`
      ALTER TABLE "feature_tokens" DROP CONSTRAINT IF EXISTS "UQ_feature_tokens_tokenName"
    `);
    await queryRunner.query(`
      ALTER TABLE "feature_groups" DROP CONSTRAINT IF EXISTS "UQ_feature_groups_appName"
    `);
    await queryRunner.query(`
      ALTER TABLE "feature_groups" DROP CONSTRAINT IF EXISTS "UQ_feature_groups_name"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "feature_group_features"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "office_feature_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feature_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feature_groups"`);

    // Restore original features table structure
    await queryRunner.query(`
      ALTER TABLE "features" 
      DROP COLUMN IF EXISTS "isActive"
    `);

    await queryRunner.query(`
      ALTER TABLE "features" 
      ADD COLUMN IF NOT EXISTS "tokenName" character varying NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS "isPaid" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "isDefault" boolean NOT NULL DEFAULT false
    `);
  }
}
