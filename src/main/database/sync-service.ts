import { IResult } from 'mssql';
import { jtlConnection } from './jtl-connection';
import db from './db';

interface SyncResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
}

class SyncService {
  private static instance: SyncService;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async updateSyncStatus(
    entityType: string,
    success: boolean,
    recordsProcessed: number,
    errorMessage?: string
  ): Promise<void> {
    const stmt = db.prepare(`
      INSERT INTO sync_status (
        entity_type, 
        last_successful_sync, 
        records_synced, 
        status, 
        error_message
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(entity_type) DO UPDATE SET
        last_successful_sync = excluded.last_successful_sync,
        records_synced = excluded.records_synced,
        status = excluded.status,
        error_message = excluded.error_message,
        last_attempt = CURRENT_TIMESTAMP
    `);

    stmt.run(
      entityType,
      success ? new Date().toISOString() : null,
      recordsProcessed,
      success ? 'success' : 'error',
      errorMessage || null
    );
  }

  async syncSuppliers(): Promise<SyncResult> {
    console.log("[SyncService] Starting syncSuppliers...");
    let recordsProcessed = 0;
    try {
      console.log("[SyncService] Attempting to get JTL connection for suppliers...");
      const pool = await jtlConnection.getConnection();
      console.log("[SyncService] JTL connection obtained for suppliers. Querying JTL...");
      
      let result: IResult<any>;
      try {
        // Fetch data from JTL view
        result = await pool.request().query(`
          SELECT 
            kLieferant,              -- Map to jtl_id (PK)
            cLieferantennummer,    -- Map to supplier_number
            cFirma,                -- Map to company_name
            cFirmaZusatz,          -- Map to company_addition
            cKontakt,              -- Map to contact
            cTelZentrale,          -- Map to phone
            cTelDurchwahl,         -- Map to phone_direct
            cFax,                  -- Map to fax
            cEMail,                -- Map to email
            cOrt,                  -- Map to city
            cLand,                 -- Map to country
            cPlz,                  -- Map to postal_code
            cStrasse,              -- Map to street
            cEigeneKundennummer,   -- Map to customer_number
            cAnmerkung             -- Map to notes
          FROM Beschaffung.lvLieferant
        `);
        console.log(`[SyncService] JTL query successful. Found ${result.recordset.length} suppliers.`);
      } catch (jtlError) {
        console.error("[SyncService] Error querying JTL for suppliers:", jtlError);
        throw jtlError;
      }

      const suppliers = result.recordset;
      const syncTimestamp = new Date().toISOString();

      // Prepare statement for local SQLite DB (aligned with new schema)
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO suppliers (
          jtl_id,
          supplier_number,
          company_name,
          company_addition,
          contact,
          phone,
          phone_direct,
          fax,
          email,
          city,
          country,
          postal_code,
          street,
          customer_number,
          notes,
          last_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Transaction for bulk insert/replace
      console.log("[SyncService] Processing supplier inserts/replaces...");
      try {
        for (const supplier of suppliers) {
          const supplierValues = [
            supplier.kLieferant,
            supplier.cLieferantennummer, 
            supplier.cFirma,
            supplier.cFirmaZusatz,
            supplier.cKontakt,
            supplier.cTelZentrale,
            supplier.cTelDurchwahl,
            supplier.cFax,
            supplier.cEMail,
            supplier.cOrt,
            supplier.cLand,
            supplier.cPlz,
            supplier.cStrasse,
            supplier.cEigeneKundennummer, 
            supplier.cAnmerkung,
            syncTimestamp
          ];
          // console.log(`[SyncService] Binding Supplier (jtl_id: ${supplier.kLieferant}):`, supplierValues);
          // Explicitly log the ID being inserted
          console.log(`[SyncService] Inserting supplier with jtl_id: ${supplier.kLieferant}`); 
          insertStmt.run(...supplierValues);
          recordsProcessed++;
        }
        console.log("[SyncService] Supplier inserts/replaces completed."); 
      } catch (dbError) {
        console.error("[SyncService] Error during SQLite operations for suppliers:", dbError);
        throw dbError;
      }

      await this.updateSyncStatus('suppliers', true, recordsProcessed);
      
      return {
        success: true,
        message: `Successfully synced ${recordsProcessed} suppliers`,
        recordsProcessed
      };
    } catch (error) {
      const message = `Failed to sync suppliers: ${(error as Error).message}`;
      await this.updateSyncStatus('suppliers', false, 0, message);
      return { success: false, message, recordsProcessed: 0 };
    }
  }

  async syncOrders(): Promise<SyncResult> {
    let recordsProcessed = 0;
    try {
      const pool = await jtlConnection.getConnection();
      const syncTimestamp = new Date().toISOString();
      
      // First, get recent orders from JTL view
      const ordersResult = await pool.request().query(`
        SELECT 
          kBestellung,          -- Map to jtl_id (PK)
          cBestellnummer,       -- Map to orderNumber
          dErstellt,            -- Map to orderDate
          kLieferant,           -- Map to jtl_supplier_id (FK)
          cLieferantName,       -- Map to supplierName
          nStatus,              -- Map to status
          dLieferdatum,         -- Map to deliveryDate
          cFremdbelegnummer,    -- Map to supplierReference
          fMengeGeliefert,      -- <<< ADDED: Delivered quantity
          fGesamtmenge          -- <<< ADDED: Total quantity
          -- Ignoring: cInternerKommentar, fSummePositionenNetto, fSummePositionenBrutto
        FROM Beschaffung.lvBestellung
        WHERE dErstellt >= DATEADD(month, -3, GETDATE()) -- Last 3 months
      `);

      const orders = ordersResult.recordset;

      // Prepare statement for local supplier_orders table (aligned with new schema)
      const insertOrderStmt = db.prepare(`
        INSERT OR REPLACE INTO supplier_orders (
          jtl_id,
          orderNumber,
          orderDate,
          jtl_supplier_id,
          supplierName,
          status,
          deliveryDate,
          supplierReference,
          last_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Fetch all relevant order items in a single query if possible (more efficient)
      // Although fetching per order might be safer for large datasets
      const orderItems: Record<number, any[]> = {};
      const allOrderIds = orders.map(o => o.kBestellung);
      
      if (allOrderIds.length > 0) {
        // Assuming SQL Server parameter handling allows for IN clause like this
        // Constructing parameter placeholders
        const idParams = allOrderIds.map((_, i) => `@orderId${i}`).join(',');
        const request = pool.request();
        allOrderIds.forEach((id, i) => request.input(`orderId${i}`, id));

        const itemsResult = await request.query(`
            SELECT 
              kBestellungPos,     -- Map to jtl_id (PK)
              kBestellung,        -- Map to orderId (FK)
              kArtikel,           -- Map to jtl_article_id
              cArtNr,             -- Map to sku
              cName,              -- Map to productName
              fMenge,             -- Map to quantity
              fEKNetto            -- Map to price
              -- Ignoring: cLieferantenArtNr
            FROM Beschaffung.lvBestellPositionen
            WHERE kBestellung IN (${idParams})
        `);
        // Group items by order ID
        for (const item of itemsResult.recordset) {
          if (!orderItems[item.kBestellung]) {
            orderItems[item.kBestellung] = [];
          }
          orderItems[item.kBestellung].push(item);
        }
      }
      
      // Prepare statement for local order_products table (aligned with new schema)
      const insertOrderItemStmt = db.prepare(`
        INSERT OR REPLACE INTO order_products (
          jtl_id,
          orderId,            -- Should be JTL Order Key (kBestellung)
          jtl_article_id,
          productName,
          quantity,
          price,
          sku,
          last_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Transaction for bulk insert/replace
      console.log("[SyncService] Processing order and item inserts/replaces...");
      try {
        for (const order of orders) {
          // Determine status based on delivered quantity and nStatus
          let status: 'bestellt' | 'geliefert' | 'teilgeliefert' | 'storniert' = 'bestellt';
          if (order.nStatus === 4) {
            status = 'storniert';
          } else if (order.fGesamtmenge > 0 && order.fMengeGeliefert > 0) { // Check if delivery started and total quantity is valid
            if (order.fMengeGeliefert >= order.fGesamtmenge) {
              status = 'geliefert'; // Fully delivered
            } else {
              status = 'teilgeliefert'; // Partially delivered
            }
          } else if (order.fMengeGeliefert === 0) {
            status = 'bestellt'; // No delivery started yet
          } else {
            // Fallback or default case if quantities are weird (e.g., Gesamtmenge is 0)
            // We could potentially use nStatus here as a fallback if needed, but 'bestellt' is safest
            status = 'bestellt'; 
          }

          // Insert/Replace Order
          const orderValues = [
            order.kBestellung,        // jtl_id (PK)
            order.cBestellnummer,     // orderNumber
            order.dErstellt instanceof Date ? order.dErstellt.toISOString() : order.dErstellt, // orderDate - Ensure string
            order.kLieferant,         // jtl_supplier_id
            order.cLieferantName,     // supplierName
            status,                   // status
            order.dLieferdatum instanceof Date ? order.dLieferdatum.toISOString() : order.dLieferdatum, // deliveryDate - Ensure string or null
            order.cFremdbelegnummer,  // supplierReference
            syncTimestamp             // last_synced
          ];
          // Enhanced logging with types
          const orderValueTypes = orderValues.map(v => `${typeof v}: ${v === null ? 'null' : JSON.stringify(v)}`).join(', ');
          console.log(`[SyncService] Binding Order (jtl_id: ${order.kBestellung}) Types: [${orderValueTypes}]`);
          
          // *** PRE-INSERT VERIFICATION ***
          try {
            const supplierCheckStmt = db.prepare('SELECT jtl_id FROM suppliers WHERE jtl_id = ?');
            const supplierIdToCheck = order.kLieferant; // The supplier ID for *this* order
            const supplierCheckResult = supplierCheckStmt.get(supplierIdToCheck);
            if (supplierCheckResult) {
              console.log(`[SyncService] PRE-INSERT CHECK PASSED: Supplier ${supplierIdToCheck} found for order ${order.kBestellung}.`);
            } else {
              console.error(`[SyncService] PRE-INSERT CHECK FAILED: Supplier ${supplierIdToCheck} NOT FOUND for order ${order.kBestellung}. FK constraint WILL fail.`);
            }
          } catch (verificationError) {
            console.error(`[SyncService] Error during pre-insert supplier check for order ${order.kBestellung}:`, verificationError);
          }
          // ************************************
          
          try {
            insertOrderStmt.run(...orderValues);
          } catch (err) {
            console.error(`[SyncService] SQLite Error inserting ORDER jtl_id ${order.kBestellung}:`, err);
            console.error('[SyncService] Failing Order Values:', orderValues);
            throw err; // Re-throw to abort transaction
          }

          // *** FETCH THE INTERNAL ID AFTER INSERT/REPLACE ***
          let localOrderId: number | undefined;
          try {
            const getOrderInternalIdStmt = db.prepare('SELECT id FROM supplier_orders WHERE jtl_id = ?');
            const result = getOrderInternalIdStmt.get(order.kBestellung) as { id: number } | undefined;
            localOrderId = result?.id;
            if (!localOrderId) {
              throw new Error(`Failed to retrieve internal id for order jtl_id ${order.kBestellung} after insert/replace.`);
            }
          } catch (fetchError) {
            console.error(`[SyncService] Error fetching internal ID for order jtl_id ${order.kBestellung}:`, fetchError);
            throw fetchError; // Propagate error to stop the transaction
          }
          // *************************************************

          // Insert/Replace Order Items for this order
          const items = orderItems[order.kBestellung] || [];
          console.log(`[SyncService] Processing ${items.length} items for order jtl_id: ${order.kBestellung}, localId: ${localOrderId}`); // Log entry into item loop
          for (const item of items) {
            // Log raw item data first
            console.log(`[SyncService] Raw item data for jtl_id ${item.kBestellungPos}:`, item);
            
            const itemValues = [
              item.kBestellungPos,    // jtl_id (PK)
              localOrderId,           // <<< USE THE FETCHED INTERNAL ID HERE
              item.kArtikel,          // jtl_article_id
              item.cName,             // productName
              item.fMenge,            // quantity
              item.fEKNetto,          // price
              item.cArtNr,            // sku
              syncTimestamp           // last_synced
            ];
            // Enhanced logging with types
            const itemValueTypes = itemValues.map(v => `${typeof v}: ${v === null ? 'null' : JSON.stringify(v)}`).join(', ');
            console.log(`[SyncService] Binding Order Item (jtl_id: ${item.kBestellungPos}, order_local_id: ${localOrderId}) Types: [${itemValueTypes}]`);
            try {
              insertOrderItemStmt.run(...itemValues);
            } catch (err) {
              console.error(`[SyncService] SQLite Error inserting ITEM jtl_id ${item.kBestellungPos} for order jtl_id ${order.kBestellung} (localId: ${localOrderId}):`, err);
              console.error('[SyncService] Failing Item Values:', itemValues);
              throw err; // Re-throw to abort transaction
            }
          }

          recordsProcessed++;
        }
        console.log("[SyncService] Order and item inserts/replaces completed.");
      } catch (dbError) {
        console.error("[SyncService] Error during SQLite operations for orders/items:", dbError);
        throw dbError; // Re-throw
      }

      await this.updateSyncStatus('orders', true, recordsProcessed);
      
      return {
        success: true,
        message: `Successfully synced ${recordsProcessed} orders`, // This counts orders, not items
        recordsProcessed
      };
    } catch (error) {
      const message = `Failed to sync orders: ${(error as Error).message}`;
      await this.updateSyncStatus('orders', false, 0, message);
      return { success: false, message, recordsProcessed: 0 };
    }
  }

  async syncAll(): Promise<SyncResult[]> {
    console.log("[SyncService] Starting syncAll...");
    const results: SyncResult[] = [];
    
    try {
      console.log("[SyncService] Calling syncSuppliers...");
      const supplierResult = await this.syncSuppliers();
      results.push(supplierResult);
      console.log("[SyncService] syncSuppliers finished. Result:", supplierResult);
      
      if (supplierResult?.success) {
        console.log("[SyncService] Suppliers synced successfully. Calling syncOrders...");
        results.push(await this.syncOrders());
        console.log("[SyncService] syncOrders finished.");
      } else {
        console.warn("[SyncService] Skipping order sync because supplier sync failed or reported no success.");
      }
      
      const success = results.every(r => r.success);
      const totalRecords = results.reduce((sum, r) => sum + r.recordsProcessed, 0);
      
      // Update overall sync status (optional)
      // await this.updateSyncStatus('all', success, totalRecords, success ? undefined : results.map(r => r.message).join('; '));

      return results;
    } catch (error) {
      console.error("[SyncService] Error during syncAll:", error);
      const message = `Failed to complete full sync: ${error instanceof Error ? error.message : String(error)}`;
      // Maybe add a specific error result for the overall failure
      results.push({ success: false, message, recordsProcessed: 0 });
      return results;
    }
  }
}

export const syncService = SyncService.getInstance(); 