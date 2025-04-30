import { initializeProcurementTables } from './procurement';
import { initializeDefaultSettings } from './settings';

export async function initializeDatabase() {
  // Initialize procurement tables first since settings depend on them
  initializeProcurementTables();
  
  // Initialize settings (this will now include procurement workflows)
  initializeDefaultSettings();
}