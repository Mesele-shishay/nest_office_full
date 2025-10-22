import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FeatureGroup } from './feature-group.entity';
import { FeatureToken } from './feature-token.entity';
import { Office } from '../../office/entities/office.entity';

@Entity('office_feature_groups')
@Unique(['officeId', 'featureGroupId'])
export class OfficeFeatureGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  officeId: string;

  @Column()
  featureGroupId: string;

  @Column({ nullable: true })
  tokenId?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  activatedAt?: Date;

  @ManyToOne(() => Office, (office) => office.featureGroups)
  @JoinColumn({ name: 'officeId' })
  office: Office;

  @ManyToOne(
    () => FeatureGroup,
    (featureGroup) => featureGroup.officeFeatureGroups,
  )
  @JoinColumn({ name: 'featureGroupId' })
  featureGroup: FeatureGroup;

  @ManyToOne(() => FeatureToken, (token) => token.officeFeatureGroups, {
    nullable: true,
  })
  @JoinColumn({ name: 'tokenId' })
  token?: FeatureToken;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
