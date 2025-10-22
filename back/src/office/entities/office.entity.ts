import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OfficeType } from './office-type.entity';
import { User } from '../../users/entities/user.entity';
import { OfficeFeatureGroup } from '../../office-features/entities/office-feature-group.entity';

export enum OfficeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('offices')
export class Office {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: OfficeStatus,
    default: OfficeStatus.ACTIVE,
  })
  status: OfficeStatus;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  qrCode: string;

  @Column()
  officeTypeId: string;

  @ManyToOne(() => OfficeType, (officeType) => officeType.offices)
  @JoinColumn({ name: 'officeTypeId' })
  officeType: OfficeType;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column()
  countryId: number;

  @Column()
  stateId: number;

  @Column()
  cityId: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => User, (user) => user.office, { nullable: true })
  managers?: User[];

  @OneToMany(
    () => OfficeFeatureGroup,
    (officeFeatureGroup) => officeFeatureGroup.office,
    {
      nullable: true,
    },
  )
  featureGroups?: OfficeFeatureGroup[];

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Contact info supplied at registration time for provisioning manager
  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  // Registration and approval metadata
  @Column({ type: 'uuid', nullable: true })
  requestedBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
