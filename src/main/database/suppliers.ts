import db from './db';
import { v4 as uuidv4 } from 'uuid';
import { Supplier } from '../../shared/types';

export function initializeSuppliersTables(): void {
  // Create suppliers table - Align with syncService logic
  db.prepare(`
    CREATE TABLE IF NOT EXISTS suppliers (
      jtl_id INTEGER PRIMARY KEY, -- JTL Primary Key
      supplier_number TEXT UNIQUE, -- From cLieferantennummer
      company_name TEXT,           -- From cFirma
      company_addition TEXT,       -- From cFirmaZusatz
      contact TEXT,                -- From cKontakt
      phone TEXT,                  -- From cTelZentrale
      phone_direct TEXT,           -- From cTelDurchwahl
      fax TEXT,                    -- From cFax
      email TEXT,                  -- From cEMail
      city TEXT,                   -- From cOrt
      country TEXT,                -- From cLand
      postal_code TEXT,            -- From cPlz
      street TEXT,                 -- From cStrasse
      customer_number TEXT,        -- From cEigeneKundennummer (Our Nr at Supplier)
      notes TEXT,                  -- From cAnmerkung
      last_synced TEXT NOT NULL    -- Sync timestamp
    )
  `).run();

  // Create indexes
  db.prepare('CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_number ON suppliers (supplier_number)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_suppliers_company_name ON suppliers (company_name)').run();
}

// --- Functions below need review if their logic depends heavily on the old schema ---
// --- For now, assume they adapt or will be adjusted later ---

// --- Updated functions below to reflect the new schema. Create/Update/Delete are disabled. ---

export async function getSuppliers(filters: Record<string, any> = {}): Promise<Supplier[]> {
  // Basic query - adjust filters as needed for new columns
  let query = `SELECT 
    jtl_id, supplier_number, company_name, company_addition, contact, 
    phone, phone_direct, fax, email, city, country, postal_code, street, 
    customer_number, notes, last_synced 
  FROM suppliers WHERE 1=1`;
  const params: any[] = [];

  // Example filter (adjust key if needed)
  /*
  if (filters.company_name) {
    query += ' AND company_name LIKE ?';
    params.push(`%${filters.company_name}%`);
  }
  */

  // Add ORDER BY if desired
  query += ' ORDER BY company_name ASC';

  const rows = db.prepare(query).all(...params) as any[];

  // Map directly to the Supplier type (ensure all fields are covered)
  return rows.map(row => ({
    jtl_id: row.jtl_id,
    supplier_number: row.supplier_number,
    company_name: row.company_name,
    company_addition: row.company_addition,
    contact: row.contact,
    phone: row.phone,
    phone_direct: row.phone_direct,
    fax: row.fax,
    email: row.email,
    city: row.city,
    country: row.country,
    postal_code: row.postal_code,
    street: row.street,
    customer_number: row.customer_number,
    notes: row.notes,
    last_synced: row.last_synced
  }));
}

export async function getSupplierById(jtlSupplierId: number): Promise<Supplier | null> {
  const row = db.prepare(`SELECT 
      jtl_id, supplier_number, company_name, company_addition, contact, 
      phone, phone_direct, fax, email, city, country, postal_code, street, 
      customer_number, notes, last_synced 
    FROM suppliers WHERE jtl_id = ?`).get(jtlSupplierId) as any;

  if (!row) return null;

  return {
    jtl_id: row.jtl_id,
    supplier_number: row.supplier_number,
    company_name: row.company_name,
    company_addition: row.company_addition,
    contact: row.contact,
    phone: row.phone,
    phone_direct: row.phone_direct,
    fax: row.fax,
    email: row.email,
    city: row.city,
    country: row.country,
    postal_code: row.postal_code,
    street: row.street,
    customer_number: row.customer_number,
    notes: row.notes,
    last_synced: row.last_synced
  };
}

export async function getSupplierByCode(supplierNumber: string): Promise<Supplier | null> {
  const row = db.prepare(`SELECT 
      jtl_id, supplier_number, company_name, company_addition, contact, 
      phone, phone_direct, fax, email, city, country, postal_code, street, 
      customer_number, notes, last_synced 
    FROM suppliers WHERE supplier_number = ?`).get(supplierNumber) as any;

  if (!row) return null;

  return {
    jtl_id: row.jtl_id,
    supplier_number: row.supplier_number,
    company_name: row.company_name,
    company_addition: row.company_addition,
    contact: row.contact,
    phone: row.phone,
    phone_direct: row.phone_direct,
    fax: row.fax,
    email: row.email,
    city: row.city,
    country: row.country,
    postal_code: row.postal_code,
    street: row.street,
    customer_number: row.customer_number,
    notes: row.notes,
    last_synced: row.last_synced
  };
}

/* --- Create/Update/Delete are disabled as data comes from sync ---
export async function createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
  // Needs complete rewrite for new schema and to decide how local creation interacts with sync
  throw new Error('Local supplier creation not currently supported, use sync.');
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  // Needs rewrite for new schema and to decide how local updates interact with sync
  throw new Error('Local supplier update not currently supported, data comes from sync.');
}

export async function deleteSupplier(jtlSupplierId: number): Promise<void> {
  // Needs review regarding cascading deletes or handling related synced data (orders?)
  console.warn('Local supplier deletion needs careful review due to synced data.');
  // db.prepare('DELETE FROM suppliers WHERE jtl_id = ?').run(jtlSupplierId);
  throw new Error('Local supplier deletion not currently supported.');
}
*/