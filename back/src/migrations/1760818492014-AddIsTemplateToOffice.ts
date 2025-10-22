import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsTemplateToOffice1760818492014 implements MigrationInterface {
  name = 'AddIsTemplateToOffice1760818492014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if isTemplate column already exists
    const isTemplateExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'offices' AND column_name = 'isTemplate'
    `);

    if (isTemplateExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE offices ADD isTemplate boolean NOT NULL DEFAULT false`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE offices DROP COLUMN isTemplate`);
  }
}
