import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('global_settings')
@Index(['key'], { unique: true })
export class GlobalSettings {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the global setting',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'feature.enableBeta',
    description: 'Unique key identifier for the setting',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @ApiProperty({
    example: 'true',
    description: 'Raw value stored as string',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  value: string;

  @ApiProperty({
    example: 'boolean',
    enum: ['string', 'number', 'boolean', 'json', 'array'],
    description: 'Data type for value parsing',
  })
  @Column({ type: 'varchar', length: 50, default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';

  @ApiProperty({
    example: 'Enable beta features for testing purposes',
    description: 'Human-readable description of the setting',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ApiProperty({
    example: 'features',
    enum: ['system', 'security', 'ui', 'features', 'notifications'],
    description: 'Category for grouping settings',
  })
  @Column({ type: 'varchar', length: 50, default: 'system' })
  category: 'system' | 'security' | 'ui' | 'features' | 'notifications';

  @ApiProperty({
    example: true,
    description: 'Whether the setting can be edited',
  })
  @Column({ type: 'boolean', default: true })
  isEditable: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether changing this setting requires restart',
  })
  @Column({ type: 'boolean', default: false })
  requiresRestart: boolean;

  @ApiProperty({
    example: '{"min": 0, "max": 100}',
    description: 'JSON string containing validation rules',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  validationRules: string; // JSON string for validation rules

  @ApiProperty({
    example: 'false',
    description: 'Default value for the setting',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Timestamp when the setting was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T14:45:00Z',
    description: 'Timestamp when the setting was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to parse value based on type
  getParsedValue(): unknown {
    if (!this.value) {
      return this.getDefaultParsedValue();
    }

    try {
      switch (this.type) {
        case 'boolean':
          return this.value === 'true';
        case 'number':
          return Number(this.value);
        case 'json':
          return JSON.parse(this.value) as unknown;
        case 'array':
          return JSON.parse(this.value) as unknown;
        case 'string':
        default:
          return this.value;
      }
    } catch (error) {
      console.warn(`Failed to parse value for setting ${this.key}:`, error);
      return this.getDefaultParsedValue();
    }
  }

  // Helper method to get default parsed value
  private getDefaultParsedValue(): unknown {
    if (!this.defaultValue) {
      return this.type === 'boolean' ? false : this.type === 'number' ? 0 : '';
    }

    try {
      switch (this.type) {
        case 'boolean':
          return this.defaultValue === 'true';
        case 'number':
          return Number(this.defaultValue);
        case 'json':
          return JSON.parse(this.defaultValue) as unknown;
        case 'array':
          return JSON.parse(this.defaultValue) as unknown;
        case 'string':
        default:
          return this.defaultValue;
      }
    } catch (error) {
      console.warn(
        `Failed to parse default value for setting ${this.key}:`,
        error,
      );
      return this.type === 'boolean' ? false : this.type === 'number' ? 0 : '';
    }
  }

  // Helper method to set value with type conversion
  setValue(value: unknown): void {
    switch (this.type) {
      case 'boolean':
        this.value = String(Boolean(value));
        break;
      case 'number':
        this.value = String(Number(value));
        break;
      case 'json':
      case 'array':
        this.value = JSON.stringify(value);
        break;
      case 'string':
      default:
        this.value = String(value);
        break;
    }
  }
}
