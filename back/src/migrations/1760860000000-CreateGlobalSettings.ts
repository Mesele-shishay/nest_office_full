import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGlobalSettings1760860000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'global_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'key', type: 'varchar', length: '100', isUnique: true },
          { name: 'value', type: 'text', isNullable: true },
          { name: 'type', type: 'varchar', length: '50', default: `'string'` },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            default: `'system'`,
          },
          { name: 'isEditable', type: 'boolean', default: true },
          { name: 'requiresRestart', type: 'boolean', default: false },
          { name: 'validationRules', type: 'text', isNullable: true },
          { name: 'defaultValue', type: 'text', isNullable: true },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'global_settings',
      new TableIndex({
        name: 'IDX_global_settings_key',
        columnNames: ['key'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('global_settings', 'IDX_global_settings_key');
    await queryRunner.dropTable('global_settings');
  }
}
