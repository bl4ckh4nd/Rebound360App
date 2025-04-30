import * as settingsDb from './settings';
import * as procurementDb from './procurement';
import { initializeDatabase as initDbSchema } from './db';

export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Initialize base database schema first (this creates all required tables)
    console.log('Initializing base schema...');
    initDbSchema();
    console.log('Base schema initialized successfully');
    
    // Initialize procurement tables and workflow
    console.log('Initializing procurement tables...');
    try {
      procurementDb.initializeProcurementTables();
      console.log('Procurement tables initialized successfully');
    } catch (error) {
      console.error('Error initializing procurement tables:', error);
      throw error;
    }
    
    // Then initialize default settings (which depends on tables existing)
    console.log('Initializing default settings...');
    try {
      settingsDb.initializeDefaultSettings();
      console.log('Default settings initialized successfully');
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw error;
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  }
}

// Export database initialization and configuration
export { default as db, getUploadsPath } from './db';

// Export return-related database operations
export * from './returns';

// Export document-related database operations
export * from './documents';

// Export order-related database operations
export * from './orders';

// Export settings-related database operations
export * from './settings';

// Export procurement-related database operations
export * from './procurement';