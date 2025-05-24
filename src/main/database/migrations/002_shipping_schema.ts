import Database from 'better-sqlite3';

export const migration002_shipping_schema = {
  id: '002_shipping_schema',
  description: 'Add shipping labels and tracking tables',
  up: (db: Database.Database) => {
    // Create shipping_labels table
    db.exec(`
      CREATE TABLE IF NOT EXISTS shipping_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id INTEGER NOT NULL,
        shipment_number TEXT NOT NULL UNIQUE,
        tracking_number TEXT,
        routing_code TEXT,
        label_data TEXT NOT NULL, -- Base64 encoded PDF
        label_filename TEXT,
        shipper_name TEXT NOT NULL,
        shipper_address TEXT NOT NULL,
        shipper_city TEXT NOT NULL,
        shipper_postal_code TEXT NOT NULL,
        shipper_country TEXT NOT NULL,
        shipper_phone TEXT,
        shipper_email TEXT,
        consignee_name TEXT NOT NULL,
        consignee_address TEXT NOT NULL,
        consignee_city TEXT NOT NULL,
        consignee_postal_code TEXT NOT NULL,
        consignee_country TEXT NOT NULL,
        consignee_phone TEXT,
        consignee_email TEXT,
        service_type TEXT NOT NULL DEFAULT 'V01PAK',
        weight REAL NOT NULL,
        length REAL,
        width REAL,
        height REAL,
        status TEXT NOT NULL DEFAULT 'created',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (return_id) REFERENCES supplier_returns (id) ON DELETE CASCADE
      )
    `);

    // Create shipping_tracking table for tracking updates
    db.exec(`
      CREATE TABLE IF NOT EXISTS shipping_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipping_label_id INTEGER NOT NULL,
        tracking_number TEXT NOT NULL,
        status TEXT NOT NULL,
        status_description TEXT,
        location TEXT,
        timestamp DATETIME NOT NULL,
        event_details TEXT, -- JSON string for additional event data
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shipping_label_id) REFERENCES shipping_labels (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shipping_labels_return_id ON shipping_labels (return_id);
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shipping_labels_shipment_number ON shipping_labels (shipment_number);
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking_number ON shipping_labels (tracking_number);
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shipping_tracking_label_id ON shipping_tracking (shipping_label_id);
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shipping_tracking_number ON shipping_tracking (tracking_number);
    `);

    // Create trigger to update updated_at timestamp
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_shipping_labels_timestamp
      AFTER UPDATE ON shipping_labels
      FOR EACH ROW
      BEGIN
        UPDATE shipping_labels SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    console.log('Applied migration: 002_shipping_schema');
  },
  down: (db: Database.Database) => {
    db.exec('DROP TRIGGER IF EXISTS update_shipping_labels_timestamp');
    db.exec('DROP INDEX IF EXISTS idx_shipping_tracking_number');
    db.exec('DROP INDEX IF EXISTS idx_shipping_tracking_label_id');
    db.exec('DROP INDEX IF EXISTS idx_shipping_labels_tracking_number');
    db.exec('DROP INDEX IF EXISTS idx_shipping_labels_shipment_number');
    db.exec('DROP INDEX IF EXISTS idx_shipping_labels_return_id');
    db.exec('DROP TABLE IF EXISTS shipping_tracking');
    db.exec('DROP TABLE IF EXISTS shipping_labels');
    
    console.log('Reverted migration: 002_shipping_schema');
  }
};