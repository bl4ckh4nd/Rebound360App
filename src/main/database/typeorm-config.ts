import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import { app } from 'electron';
import { getDbPath } from './db';

// Import all entities
import * as entities from './entities';

// Get all entity classes from the entities module
const entityList = Object.values(entities).filter(
  entity => typeof entity === 'function' && entity.toString().includes('class')
);

// TypeORM configuration for SQLite using better-sqlite3
export const getDatabaseConfig = (): DataSourceOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    type: 'better-sqlite3',
    database: getDbPath(), // Use the existing database path function
    entities: entityList,
    synchronize: false, // Never auto-sync - we manage schema manually
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    migrations: [path.join(__dirname, 'typeorm-migrations', '*.{js,ts}')],
    migrationsTableName: 'typeorm_migrations',
    // SQLite specific options
    enableWAL: true, // Enable Write-Ahead Logging for better performance
  };
};

// Create data source instance
let AppDataSource: DataSource | null = null;

// Get or create data source
export function getDataSource(): DataSource {
  if (!AppDataSource) {
    AppDataSource = new DataSource(getDatabaseConfig());
  }
  return AppDataSource;
}

// Initialize TypeORM
export async function initializeTypeORM(): Promise<DataSource> {
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    console.log('TypeORM initialized successfully');
    
    // Run any pending migrations in production
    if (process.env.NODE_ENV === 'production') {
      const pendingMigrations = await dataSource.showMigrations();
      if (pendingMigrations) {
        console.log('Running pending TypeORM migrations...');
        await dataSource.runMigrations();
      }
    }
  }
  
  return dataSource;
}

// Close TypeORM connection
export async function closeTypeORM(): Promise<void> {
  if (AppDataSource && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('TypeORM connection closed');
    AppDataSource = null;
  }
}

// Export for use in repositories
export { AppDataSource };