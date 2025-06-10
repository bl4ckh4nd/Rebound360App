"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadsDir = void 0;
exports.getUploadsPath = getUploadsPath;
exports.getDbPath = getDbPath;
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
var better_sqlite3_1 = require("better-sqlite3");
var path_1 = require("path");
var fs_1 = require("fs");
var electron_1 = require("electron");
// Initialize SQLite database
var db = new better_sqlite3_1.default('supplier_returns.db');
// Ensure uploads directory exists
var getUploadsDir = function () {
    var uploadsDir = path_1.default.join(electron_1.app.getPath('userData'), 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
};
exports.getUploadsDir = getUploadsDir;
function getUploadsPath() {
    return (0, exports.getUploadsDir)();
}
function getDbPath() {
    return path_1.default.join(electron_1.app.getPath('userData'), 'supplier_returns.db');
}
function getDatabase() {
    return db;
}
// Initialize database schema
function initializeDatabase() {
    // Create migrations table first
    db.exec("\n    CREATE TABLE IF NOT EXISTS migrations (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL UNIQUE,\n      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n  ");
    // Create base tables in correct order
    db.exec("\n    -- Status workflow definitions first since other tables reference them\n    CREATE TABLE IF NOT EXISTS status_workflows (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      follow_up_action TEXT NOT NULL,\n      is_default BOOLEAN DEFAULT 0,\n      workflow_type TEXT NOT NULL DEFAULT 'return',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME\n    );\n    \n    -- Individual status steps within workflows\n    CREATE TABLE IF NOT EXISTS status_steps (\n      id TEXT PRIMARY KEY,\n      workflow_id TEXT NOT NULL,\n      name TEXT NOT NULL,\n      description TEXT,\n      color TEXT NOT NULL,\n      order_index INTEGER NOT NULL,\n      required_fields TEXT, -- JSON array of field names\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME,\n      FOREIGN KEY (workflow_id) REFERENCES status_workflows(id) ON DELETE CASCADE\n    );\n    \n    -- Categories for organizing return reasons\n    CREATE TABLE IF NOT EXISTS reason_categories (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      description TEXT,\n      order_index INTEGER NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME\n    );\n    \n    -- Return reasons\n    CREATE TABLE IF NOT EXISTS return_reasons (\n      id TEXT PRIMARY KEY,\n      code TEXT NOT NULL,\n      name TEXT NOT NULL,\n      description TEXT,\n      category_id TEXT NOT NULL,\n      is_active BOOLEAN DEFAULT 1,\n      applicable_actions TEXT, -- JSON array of applicable follow-up actions\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME,\n      FOREIGN KEY (category_id) REFERENCES reason_categories(id) ON DELETE CASCADE\n    );\n\n    -- Settings table for general application settings\n    CREATE TABLE IF NOT EXISTS app_settings (\n      key TEXT PRIMARY KEY,\n      value TEXT NOT NULL,\n      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    \n    -- Custom fields definitions\n    CREATE TABLE IF NOT EXISTS custom_fields (\n      id TEXT PRIMARY KEY,\n      key TEXT UNIQUE NOT NULL,\n      label TEXT NOT NULL,\n      description TEXT,\n      type TEXT NOT NULL,\n      required INTEGER DEFAULT 0,\n      default_value TEXT,\n      options TEXT,\n      entity_type TEXT DEFAULT 'return',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME\n    );\n\n    -- Supplier orders and related tables\n    CREATE TABLE IF NOT EXISTS supplier_orders (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      orderNumber TEXT NOT NULL,\n      supplierReference TEXT,\n      orderDate TEXT NOT NULL,\n      deliveryDate TEXT,\n      supplierName TEXT NOT NULL,\n      status TEXT NOT NULL CHECK (status IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')),\n      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updatedAt DATETIME\n    );\n\n    CREATE TABLE IF NOT EXISTS order_products (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      orderId INTEGER NOT NULL,\n      productName TEXT NOT NULL,\n      quantity INTEGER NOT NULL,\n      price REAL NOT NULL,\n      sku TEXT,\n      serialNumber TEXT,\n      FOREIGN KEY (orderId) REFERENCES supplier_orders(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS supplier_returns (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      orderNumber TEXT,\n      status TEXT NOT NULL,\n      followUpAction TEXT NOT NULL CHECK (followUpAction IN ('gutschrift', 'ersatz', 'reparatur', 'ausschuss')),\n      workflow_id TEXT REFERENCES status_workflows(id),\n      supplierReference TEXT,\n      commissioningDate TEXT,\n      shippingDate TEXT,\n      creditNoteNumber TEXT,\n      creditAmount REAL,\n      originalInvoiceNumber TEXT,\n      creditDate TEXT,\n      creditNoteStatus TEXT CHECK (creditNoteStatus IN ('erstellt', 'abgestimmt')),\n      reconciliationDate TEXT,\n      reconciliationInvoiceNumber TEXT,\n      orderId INTEGER,\n      creditorNumber TEXT,\n      customFields TEXT, -- JSON field to store custom field values\n      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n      updatedAt DATETIME,\n      FOREIGN KEY (orderId) REFERENCES supplier_orders(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS return_products (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      returnId INTEGER NOT NULL,\n      productName TEXT NOT NULL,\n      quantity INTEGER NOT NULL,\n      reason TEXT NOT NULL,\n      serialNumber TEXT,\n      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS return_notes (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      returnId INTEGER NOT NULL,\n      content TEXT NOT NULL,\n      author TEXT NOT NULL,\n      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS return_documents (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      returnId INTEGER NOT NULL,\n      fileName TEXT NOT NULL,\n      fileType TEXT NOT NULL,\n      fileSize INTEGER NOT NULL,\n      filePath TEXT NOT NULL,\n      description TEXT,\n      thumbnailPath TEXT,\n      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (returnId) REFERENCES supplier_returns(id)\n    );\n  ");
    // Check if sync schema migration has been applied
    var syncMigrationApplied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get('001_sync_schema');
    if (!syncMigrationApplied) {
        try {
            // Start transaction for the migration
            db.transaction(function () {
                // Helper function to safely add simple column if it doesn't exist
                var addColumnIfNotExists = function (table, column, definition) {
                    var columnExists = db.prepare("PRAGMA table_info(".concat(table, ")")).all()
                        .some(function (col) { return col.name === column; });
                    if (!columnExists) {
                        db.exec("ALTER TABLE ".concat(table, " ADD COLUMN ").concat(column, " ").concat(definition));
                    }
                };
                // Create suppliers table FIRST
                db.exec("\n          CREATE TABLE IF NOT EXISTS suppliers (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            jtl_id INTEGER UNIQUE,\n            supplier_number TEXT,\n            company_name TEXT,\n            company_addition TEXT,\n            contact TEXT,\n            phone TEXT,\n            phone_direct TEXT,\n            fax TEXT,\n            email TEXT,\n            city TEXT,\n            country TEXT,\n            postal_code TEXT,\n            street TEXT,\n            customer_number TEXT,\n            notes TEXT,\n            last_synced DATETIME\n          );\n        ");
                // For supplier_orders, create new table and migrate data
                db.exec("\n          CREATE TABLE IF NOT EXISTS supplier_orders_new (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            orderNumber TEXT NOT NULL,\n            supplierReference TEXT,\n            orderDate TEXT NOT NULL,\n            deliveryDate TEXT,\n            supplierName TEXT NOT NULL,\n            status TEXT NOT NULL CHECK (status IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')),\n            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n            updatedAt DATETIME,\n            jtl_id INTEGER UNIQUE,\n            jtl_supplier_id INTEGER,\n            last_synced DATETIME,\n            FOREIGN KEY (jtl_supplier_id) REFERENCES suppliers(jtl_id) ON DELETE SET NULL\n          );\n\n          INSERT INTO supplier_orders_new (\n            id, orderNumber, supplierReference, orderDate, deliveryDate,\n            supplierName, status, createdAt, updatedAt, jtl_id, jtl_supplier_id, last_synced\n          )\n          SELECT \n            id, orderNumber, supplierReference, orderDate, deliveryDate,\n            supplierName, status, createdAt, updatedAt, \n            NULL, NULL, NULL -- Provide NULL for new columns not in original table\n          FROM supplier_orders;\n\n          DROP TABLE supplier_orders;\n          ALTER TABLE supplier_orders_new RENAME TO supplier_orders;\n        ");
                // For order_products, create new table and migrate data
                db.exec("\n          CREATE TABLE IF NOT EXISTS order_products_new (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            orderId INTEGER NOT NULL,\n            productName TEXT NOT NULL,\n            quantity INTEGER NOT NULL,\n            price REAL NOT NULL,\n            sku TEXT,\n            serialNumber TEXT,\n            jtl_id INTEGER UNIQUE,\n            jtl_article_id INTEGER,\n            last_synced DATETIME,\n            FOREIGN KEY (orderId) REFERENCES supplier_orders(id) ON DELETE CASCADE\n          );\n\n          INSERT INTO order_products_new (\n            id, orderId, productName, quantity, price, sku, serialNumber,\n            jtl_id, jtl_article_id, last_synced\n          )\n          SELECT \n            id, orderId, productName, quantity, price, sku, serialNumber,\n            NULL, NULL, NULL -- Provide NULL for new columns not in original table\n          FROM order_products;\n\n          DROP TABLE order_products;\n          ALTER TABLE order_products_new RENAME TO order_products;\n        ");
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
                db.exec("\n          CREATE TABLE IF NOT EXISTS sync_status (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            entity_type TEXT NOT NULL UNIQUE,\n            last_successful_sync DATETIME,\n            records_synced INTEGER DEFAULT 0,\n            status TEXT,\n            error_message TEXT,\n            last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP\n          );\n          ");
                // Record the migration
                db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_sync_schema');
            })();
            console.log('Successfully applied JTL sync schema migration');
        }
        catch (error) {
            console.error('Error applying JTL sync schema migration:', error);
            throw error;
        }
    }
    // Check if shipping schema migration has been applied
    var shippingMigrationApplied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get('002_shipping_schema');
    if (!shippingMigrationApplied) {
        try {
            db.transaction(function () {
                // Create shipping_labels table
                db.exec("\n          CREATE TABLE IF NOT EXISTS shipping_labels (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            return_id INTEGER NOT NULL,\n            shipment_number TEXT NOT NULL UNIQUE,\n            tracking_number TEXT,\n            routing_code TEXT,\n            label_data TEXT NOT NULL, -- Base64 encoded PDF\n            label_filename TEXT,\n            shipper_name TEXT NOT NULL,\n            shipper_address TEXT NOT NULL,\n            shipper_city TEXT NOT NULL,\n            shipper_postal_code TEXT NOT NULL,\n            shipper_country TEXT NOT NULL,\n            shipper_phone TEXT,\n            shipper_email TEXT,\n            consignee_name TEXT NOT NULL,\n            consignee_address TEXT NOT NULL,\n            consignee_city TEXT NOT NULL,\n            consignee_postal_code TEXT NOT NULL,\n            consignee_country TEXT NOT NULL,\n            consignee_phone TEXT,\n            consignee_email TEXT,\n            service_type TEXT NOT NULL DEFAULT 'V01PAK',\n            weight REAL NOT NULL,\n            length REAL,\n            width REAL,\n            height REAL,\n            status TEXT NOT NULL DEFAULT 'created',\n            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n            FOREIGN KEY (return_id) REFERENCES supplier_returns (id) ON DELETE CASCADE\n          )\n        ");
                // Create shipping_tracking table for tracking updates
                db.exec("\n          CREATE TABLE IF NOT EXISTS shipping_tracking (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            shipping_label_id INTEGER NOT NULL,\n            tracking_number TEXT NOT NULL,\n            status TEXT NOT NULL,\n            status_description TEXT,\n            location TEXT,\n            timestamp DATETIME NOT NULL,\n            event_details TEXT, -- JSON string for additional event data\n            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n            FOREIGN KEY (shipping_label_id) REFERENCES shipping_labels (id) ON DELETE CASCADE\n          )\n        ");
                // Create indexes for better performance
                db.exec("\n          CREATE INDEX IF NOT EXISTS idx_shipping_labels_return_id ON shipping_labels (return_id);\n          CREATE INDEX IF NOT EXISTS idx_shipping_labels_shipment_number ON shipping_labels (shipment_number);\n          CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking_number ON shipping_labels (tracking_number);\n          CREATE INDEX IF NOT EXISTS idx_shipping_tracking_label_id ON shipping_tracking (shipping_label_id);\n          CREATE INDEX IF NOT EXISTS idx_shipping_tracking_number ON shipping_tracking (tracking_number);\n        ");
                // Create trigger to update updated_at timestamp
                db.exec("\n          CREATE TRIGGER IF NOT EXISTS update_shipping_labels_timestamp\n          AFTER UPDATE ON shipping_labels\n          FOR EACH ROW\n          BEGIN\n            UPDATE shipping_labels SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;\n          END;\n        ");
                // Record the migration
                db.prepare('INSERT INTO migrations (name) VALUES (?)').run('002_shipping_schema');
            })();
            console.log('Successfully applied shipping schema migration');
        }
        catch (error) {
            console.error('Error applying shipping schema migration:', error);
            throw error;
        }
    }
}
exports.default = db;
