import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

// Initialize SQLite database
const db: DatabaseType = new Database('supplier_returns.db');

// Ensure uploads directory exists
export const getUploadsDir = () => {
  const uploadsDir = path.join(app.getPath('userData'), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

export function getUploadsPath() {
  return getUploadsDir();
}

// Initialize database schema
export function initializeDatabase() {
  // Create migrations table first
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create base tables in correct order
  db.exec(`
    -- Status workflow definitions first since other tables reference them
    CREATE TABLE IF NOT EXISTS status_workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      follow_up_action TEXT NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      workflow_type TEXT NOT NULL DEFAULT 'return',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );
    
    -- Individual status steps within workflows
    CREATE TABLE IF NOT EXISTS status_steps (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      required_fields TEXT, -- JSON array of field names
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (workflow_id) REFERENCES status_workflows(id) ON DELETE CASCADE
    );
    
    -- Categories for organizing return reasons
    CREATE TABLE IF NOT EXISTS reason_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );
    
    -- Return reasons
    CREATE TABLE IF NOT EXISTS return_reasons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      applicable_actions TEXT, -- JSON array of applicable follow-up actions
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (category_id) REFERENCES reason_categories(id) ON DELETE CASCADE
    );

    -- Settings table for general application settings
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Custom fields definitions
    CREATE TABLE IF NOT EXISTS custom_fields (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      required INTEGER DEFAULT 0,
      default_value TEXT,
      options TEXT,
      entity_type TEXT DEFAULT 'return',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    -- Supplier orders and related tables
    CREATE TABLE IF NOT EXISTS supplier_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT NOT NULL,
      supplierReference TEXT,
      orderDate TEXT NOT NULL,
      deliveryDate TEXT,
      supplierName TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS order_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      sku TEXT,
      serialNumber TEXT,
      FOREIGN KEY (orderId) REFERENCES supplier_orders(id)
    );

    CREATE TABLE IF NOT EXISTS supplier_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT,
      status TEXT NOT NULL,
      followUpAction TEXT NOT NULL CHECK (followUpAction IN ('gutschrift', 'ersatz', 'reparatur', 'ausschuss')),
      workflow_id TEXT REFERENCES status_workflows(id),
      supplierReference TEXT,
      commissioningDate TEXT,
      shippingDate TEXT,
      creditNoteNumber TEXT,
      creditAmount REAL,
      originalInvoiceNumber TEXT,
      creditDate TEXT,
      creditNoteStatus TEXT CHECK (creditNoteStatus IN ('erstellt', 'abgestimmt')),
      reconciliationDate TEXT,
      reconciliationInvoiceNumber TEXT,
      orderId INTEGER,
      creditorNumber TEXT,
      customFields TEXT, -- JSON field to store custom field values
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      FOREIGN KEY (orderId) REFERENCES supplier_orders(id)
    );

    CREATE TABLE IF NOT EXISTS return_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      returnId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      serialNumber TEXT,
      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)
    );

    CREATE TABLE IF NOT EXISTS return_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      returnId INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)
    );

    CREATE TABLE IF NOT EXISTS return_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      returnId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      fileType TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      filePath TEXT NOT NULL,
      description TEXT,
      thumbnailPath TEXT,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)
    );
  `);

  // Check if sync schema migration has been applied
  const syncMigrationApplied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get('001_sync_schema');
  
  if (!syncMigrationApplied) {
    try {
      // Start transaction for the migration
      db.transaction(() => {
        // Helper function to safely add simple column if it doesn't exist
        const addColumnIfNotExists = (table: string, column: string, definition: string) => {
          const columnExists = db.prepare(`PRAGMA table_info(${table})`).all()
            .some((col: any) => col.name === column);
          
          if (!columnExists) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          }
        };

        // Create suppliers table FIRST
        db.exec(`
          CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jtl_id INTEGER UNIQUE,
            supplier_number TEXT,
            company_name TEXT,
            company_addition TEXT,
            contact TEXT,
            phone TEXT,
            phone_direct TEXT,
            fax TEXT,
            email TEXT,
            city TEXT,
            country TEXT,
            postal_code TEXT,
            street TEXT,
            customer_number TEXT,
            notes TEXT,
            last_synced DATETIME
          );
        `);

        // For supplier_orders, create new table and migrate data
        db.exec(`
          CREATE TABLE IF NOT EXISTS supplier_orders_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderNumber TEXT NOT NULL,
            supplierReference TEXT,
            orderDate TEXT NOT NULL,
            deliveryDate TEXT,
            supplierName TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME,
            jtl_id INTEGER UNIQUE,
            jtl_supplier_id INTEGER,
            last_synced DATETIME,
            FOREIGN KEY (jtl_supplier_id) REFERENCES suppliers(jtl_id) ON DELETE SET NULL
          );

          INSERT INTO supplier_orders_new (
            id, orderNumber, supplierReference, orderDate, deliveryDate,
            supplierName, status, createdAt, updatedAt, jtl_id, jtl_supplier_id, last_synced
          )
          SELECT 
            id, orderNumber, supplierReference, orderDate, deliveryDate,
            supplierName, status, createdAt, updatedAt, 
            NULL, NULL, NULL -- Provide NULL for new columns not in original table
          FROM supplier_orders;

          DROP TABLE supplier_orders;
          ALTER TABLE supplier_orders_new RENAME TO supplier_orders;
        `);

        // For order_products, create new table and migrate data
        db.exec(`
          CREATE TABLE IF NOT EXISTS order_products_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER NOT NULL,
            productName TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            sku TEXT,
            serialNumber TEXT,
            jtl_id INTEGER UNIQUE,
            jtl_article_id INTEGER,
            last_synced DATETIME,
            FOREIGN KEY (orderId) REFERENCES supplier_orders(id) ON DELETE CASCADE
          );

          INSERT INTO order_products_new (
            id, orderId, productName, quantity, price, sku, serialNumber,
            jtl_id, jtl_article_id, last_synced
          )
          SELECT 
            id, orderId, productName, quantity, price, sku, serialNumber,
            NULL, NULL, NULL -- Provide NULL for new columns not in original table
          FROM order_products;

          DROP TABLE order_products;
          ALTER TABLE order_products_new RENAME TO order_products;
        `);

        // Create suppliers table -- MOVED EARLIER
        /*
        db.exec(`
          CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jtl_id INTEGER UNIQUE,
            supplier_number TEXT,
            company_name TEXT,
            company_addition TEXT,
            contact TEXT,
            phone TEXT,
            phone_direct TEXT,
            fax TEXT,
            email TEXT,
            city TEXT,
            country TEXT,
            postal_code TEXT,
            street TEXT,
            customer_number TEXT,
            notes TEXT,
            last_synced DATETIME
          );
          */
          db.exec(`
          CREATE TABLE IF NOT EXISTS sync_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL UNIQUE,
            last_successful_sync DATETIME,
            records_synced INTEGER DEFAULT 0,
            status TEXT,
            error_message TEXT,
            last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          `);

        // Record the migration
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_sync_schema');
      })();
      
      console.log('Successfully applied JTL sync schema migration');
    } catch (error) {
      console.error('Error applying JTL sync schema migration:', error);
      throw error;
    }
  }
}

export default db;
