import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSuperAdminRole1761000000001 implements MigrationInterface {
  name = 'RemoveSuperAdminRole1761000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert any SUPER_ADMIN users back to ADMIN
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = 'ADMIN' 
      WHERE "role" = 'SUPER_ADMIN'
    `);

    // Note: PostgreSQL doesn't support removing enum values easily
    // The SUPER_ADMIN value will remain in the enum but won't be used
    // This is a simplified approach that maintains data integrity
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert ADMIN users back to SUPER_ADMIN (if needed for rollback)
    // This is optional since we're simplifying the role system
  }
}
