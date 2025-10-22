import { DataSource } from 'typeorm';
type SupportedDbType = 'postgres' | 'mysql' | 'mariadb';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Office } from './src/office/entities/office.entity';
import { OfficeType } from './src/office/entities/office-type.entity';
import { Feature } from './src/office-features/entities/feature.entity';
import { FeatureGroup } from './src/office-features/entities/feature-group.entity';
import { FeatureToken } from './src/office-features/entities/feature-token.entity';
import { OfficeFeatureGroup } from './src/office-features/entities/office-feature-group.entity';

config();

const cliDatabaseType: SupportedDbType =
  (process.env.DATABASE_TYPE as SupportedDbType) || 'postgres';
const cliDatabasePort = parseInt(
  process.env.DATABASE_PORT ||
    (cliDatabaseType === 'mysql' || cliDatabaseType === 'mariadb'
      ? '3306'
      : '5432'),
);

export default new DataSource({
  type: cliDatabaseType,
  host: process.env.DATABASE_HOST || 'localhost',
  port: cliDatabasePort,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'app_db',
  entities: [
    User,
    Office,
    OfficeType,
    Feature,
    FeatureGroup,
    FeatureToken,
    OfficeFeatureGroup,
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
});
