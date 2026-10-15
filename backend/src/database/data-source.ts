import { DataSource, DataSourceOptions } from 'typeorm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ALL_ENTITIES } from './entities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '12345',
  database: process.env.DATABASE_NAME || 'hyper_resume_db',
  entities: ALL_ENTITIES,
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
