import { Database } from 'better-sqlite3';

export function up(db: Database) {
  // Add JTL reference fields to supplier_orders
  db.exec(`
    ALTER TABLE supplier_orders 
    ADD COLUMN jtl_id INTEGER UNIQUE;
    ALTER TABLE supplier_orders 
    ADD COLUMN jtl_supplier_id INTEGER;
    ALTER TABLE supplier_orders 
    ADD COLUMN last_synced DATETIME;
  `);

  // Add JTL reference fields to order_products
  db.exec(`
    ALTER TABLE order_products 
    ADD COLUMN jtl_id INTEGER UNIQUE;
    ALTER TABLE order_products 
    ADD COLUMN jtl_article_id INTEGER;
    ALTER TABLE order_products 
    ADD COLUMN last_synced DATETIME;
  `);

  // Create suppliers table
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

  // Create sync_status table
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
}

export function down(db: Database) {
  // Remove JTL reference fields from supplier_orders
  db.exec(`
    CREATE TABLE supplier_orders_backup AS 
    SELECT id, orderNumber, supplierReference, orderDate, deliveryDate, 
           supplierName, status, createdAt, updatedAt 
    FROM supplier_orders;
    
    DROP TABLE supplier_orders;
    
    CREATE TABLE supplier_orders (
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
    
    INSERT INTO supplier_orders SELECT * FROM supplier_orders_backup;
    DROP TABLE supplier_orders_backup;
  `);

  // Remove JTL reference fields from order_products
  db.exec(`
    CREATE TABLE order_products_backup AS 
    SELECT id, orderId, productName, quantity, price, sku, serialNumber 
    FROM order_products;
    
    DROP TABLE order_products;
    
    CREATE TABLE order_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      sku TEXT,
      serialNumber TEXT,
      FOREIGN KEY (orderId) REFERENCES supplier_orders(id)
    );
    
    INSERT INTO order_products SELECT * FROM order_products_backup;
    DROP TABLE order_products_backup;
  `);

  // Drop new tables
  db.exec(`
    DROP TABLE IF EXISTS suppliers;
    DROP TABLE IF EXISTS sync_status;
  `);
} 