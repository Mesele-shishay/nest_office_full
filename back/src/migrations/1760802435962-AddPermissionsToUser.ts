import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionsToUser1760802435962 implements MigrationInterface {
  name = 'AddPermissionsToUser1760802435962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if permissions column already exists
    const permissionsExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'permissions'
    `);

    if (permissionsExists.length === 0) {
      await queryRunner.query(`ALTER TABLE users ADD permissions text`);
    }

    // Check if bannedPermissions column already exists
    const bannedPermissionsExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'bannedPermissions'
    `);

    if (bannedPermissionsExists.length === 0) {
      await queryRunner.query(`ALTER TABLE users ADD bannedPermissions text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN bannedPermissions`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN permissions`);
  }
}
