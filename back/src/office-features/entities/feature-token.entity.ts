import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { FeatureGroup } from './feature-group.entity';
import { OfficeFeatureGroup } from './office-feature-group.entity';

@Entity('feature_tokens')
export class FeatureToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tokenName: string;

  @Column()
  featureGroupId: string;

  @Column({ nullable: true })
  expiresInDays?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => FeatureGroup, (featureGroup) => featureGroup.tokens)
  @JoinColumn({ name: 'featureGroupId' })
  featureGroup: FeatureGroup;

  @OneToMany(
    () => OfficeFeatureGroup,
    (officeFeatureGroup) => officeFeatureGroup.token,
  )
  officeFeatureGroups: OfficeFeatureGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
