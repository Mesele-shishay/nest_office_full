import { TypeOrmModuleOptions } from '@nestjs/typeorm';
type SupportedDbType = 'postgres' | 'mysql' | 'mariadb';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseType =
    (configService.get<string>(
      'DATABASE_TYPE',
      'postgres',
    ) as SupportedDbType) || 'postgres';

  const defaultPort = databaseType === 'postgres' ? 5432 : 3306;
  const port = Number(
    configService.get<string>('DATABASE_PORT', String(defaultPort)),
  );

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  return {
    type: databaseType,
    host: configService.get<string>('DATABASE_HOST', '127.0.0.1'),
    port,
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    database: configService.get<string>('DATABASE_NAME', 'nest_office'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: nodeEnv === 'development',
    logging: nodeEnv === 'development',
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  };
};
