import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ALL_ENTITIES } from './entities.js';

export function getTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: Number(configService.get<number>('DATABASE_PORT', 5432)),
    database: configService.get<string>('DATABASE_NAME', 'hyper_resume_db'),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', ''),
    entities: ALL_ENTITIES,
    migrations: [],
    migrationsTableName: 'typeorm_migrations',
    // Invariant: synchronize must always be false
    synchronize: false,
    migrationsRun: false,
    logging: isDev ? ['error', 'warn', 'schema', 'migration'] : ['error'],
  };
}
