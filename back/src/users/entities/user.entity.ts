import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../common/enums/roles.enum';

// Keep UserRole for backward compatibility, map to new Role enum
export enum UserRole {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  CITY_ADMIN = 'CITY_ADMIN',
  STATE_ADMIN = 'STATE_ADMIN',
  COUNTRY_ADMIN = 'COUNTRY_ADMIN',
}

// Helper to convert between old and new role formats
export const mapUserRoleToRole = (userRole: UserRole): Role => {
  const mapping: Record<UserRole, Role> = {
    [UserRole.USER]: Role.USER,
    [UserRole.MANAGER]: Role.MANAGER,
    [UserRole.ADMIN]: Role.ADMIN,
    [UserRole.CITY_ADMIN]: Role.CITY_ADMIN,
    [UserRole.STATE_ADMIN]: Role.STATE_ADMIN,
    [UserRole.COUNTRY_ADMIN]: Role.COUNTRY_ADMIN,
  };
  return mapping[userRole];
};

export const mapRoleToUserRole = (role: Role): UserRole => {
  const mapping: Record<Role, UserRole> = {
    [Role.USER]: UserRole.USER,
    [Role.MANAGER]: UserRole.MANAGER,
    [Role.ADMIN]: UserRole.ADMIN,
    [Role.CITY_ADMIN]: UserRole.CITY_ADMIN,
    [Role.STATE_ADMIN]: UserRole.STATE_ADMIN,
    [Role.COUNTRY_ADMIN]: UserRole.COUNTRY_ADMIN,
  };
  return mapping[role];
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  nationalIdPhoto: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  phoneVerificationCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  phoneVerificationExpiry: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ type: 'simple-array', nullable: true })
  bannedPermissions: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetTokenExpiry: Date | null;

  @Column({ nullable: true })
  officeId: string | null;

  @ManyToOne('Office', 'managers', { nullable: true })
  @JoinColumn({ name: 'officeId' })
  office: any;

  @Column({ type: 'text', nullable: true })
  adminScope: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
