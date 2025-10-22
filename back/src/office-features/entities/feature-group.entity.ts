import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Feature } from './feature.entity';
import { FeatureToken } from './feature-token.entity';
import { OfficeFeatureGroup } from './office-feature-group.entity';

@Entity('feature_groups')
export class FeatureGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  appName: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isPaid: boolean;

  @ManyToMany(() => Feature, (feature) => feature.featureGroups)
  @JoinTable({
    name: 'feature_group_features',
    joinColumn: { name: 'featureGroupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'featureId', referencedColumnName: 'id' },
  })
  features: Feature[];

  @OneToMany(() => FeatureToken, (token) => token.featureGroup)
  tokens: FeatureToken[];

  @OneToMany(
    () => OfficeFeatureGroup,
    (officeFeatureGroup) => officeFeatureGroup.featureGroup,
  )
  officeFeatureGroups: OfficeFeatureGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
