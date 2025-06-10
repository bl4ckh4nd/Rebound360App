import { BaseRepository } from './base-repository';
import { Supplier } from '../entities/jtl/Supplier';
import { SupplierOrder } from '../entities/jtl/SupplierOrder';
import { OrderProduct } from '../entities/jtl/OrderProduct';
import { SyncStatus } from '../entities/system/SyncStatus';
import { getDataSource } from '../typeorm-config';
import { OrderStatus } from '../entities/types';

/**
 * Repository for JTL supplier synchronization
 */
export class SupplierSyncRepository extends BaseRepository<Supplier> {
  constructor() {
    super(Supplier);
  }

  /**
   * Upsert suppliers from JTL sync
   * Uses raw SQL for efficient bulk operations
   */
  async upsertSuppliersFromJTL(suppliers: Array<{
    jtlId: number;
    supplierNumber?: string;
    companyName?: string;
    contact?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    street?: string;
  }>): Promise<number> {
    if (suppliers.length === 0) return 0;

    // Build values for bulk insert
    const placeholders = suppliers.map(() => 
      '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).join(', ');
    
    const values: any[] = [];
    suppliers.forEach(supplier => {
      values.push(
        supplier.jtlId,
        supplier.supplierNumber || null,
        supplier.companyName || null,
        supplier.contact || null,
        supplier.email || null,
        supplier.phone || null,
        supplier.city || null,
        supplier.country || null,
        supplier.postalCode || null,
        supplier.street || null,
        new Date().toISOString()
      );
    });

    const query = `
      INSERT OR REPLACE INTO suppliers (
        jtl_id, supplier_number, company_name, contact, email,
        phone, city, country, postal_code, street, last_synced
      ) VALUES ${placeholders}
    `;

    const result = this.executeRawCommand(query, values);
    return result.changes;
  }

  /**
   * Get suppliers needing sync (not synced in last 24 hours)
   */
  async getSuppliersNeedingSync(): Promise<Supplier[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return this.findAll({
      where: [
        { lastSynced: null },
        { lastSynced: { $lt: yesterday } as any }
      ]
    });
  }

  /**
   * Search suppliers with TypeORM
   */
  async searchSuppliers(searchTerm: string): Promise<Supplier[]> {
    const query = `
      SELECT * FROM suppliers
      WHERE company_name LIKE ?
      OR supplier_number LIKE ?
      OR contact LIKE ?
      OR email LIKE ?
      ORDER BY company_name
      LIMIT 50
    `;
    
    const searchPattern = `%${searchTerm}%`;
    return this.executeRawQuery(query, [
      searchPattern, searchPattern, searchPattern, searchPattern
    ]);
  }
}

/**
 * Repository for JTL order synchronization
 */
export class OrderSyncRepository extends BaseRepository<SupplierOrder> {
  constructor() {
    super(SupplierOrder);
  }

  /**
   * Get orders with products and supplier using TypeORM
   */
  async getOrderWithDetails(orderId: number): Promise<SupplierOrder | null> {
    return this.findOne({
      where: { id: orderId },
      relations: ['products', 'supplier', 'returns']
    });
  }

  /**
   * Sync orders from JTL with products
   * Uses transaction for consistency
   */
  async syncOrdersFromJTL(orders: Array<{
    jtlId: number;
    orderNumber: string;
    supplierReference?: string;
    orderDate: string;
    deliveryDate?: string;
    supplierName: string;
    status: OrderStatus;
    jtlSupplierId?: number;
    products: Array<{
      jtlId?: number;
      productName: string;
      quantity: number;
      price: number;
      sku?: string;
      jtlArticleId?: number;
    }>;
  }>): Promise<{ ordersCreated: number; productsCreated: number }> {
    const dataSource = getDataSource();
    let ordersCreated = 0;
    let productsCreated = 0;

    await dataSource.transaction(async manager => {
      for (const orderData of orders) {
        // Check if order exists
        const existingOrder = await manager.findOne(SupplierOrder, {
          where: { jtlId: orderData.jtlId }
        });

        let order: SupplierOrder;
        
        if (existingOrder) {
          // Update existing order
          await manager.update(SupplierOrder, existingOrder.id, {
            orderNumber: orderData.orderNumber,
            supplierReference: orderData.supplierReference,
            orderDate: orderData.orderDate,
            deliveryDate: orderData.deliveryDate,
            supplierName: orderData.supplierName,
            status: orderData.status,
            jtlSupplierId: orderData.jtlSupplierId,
            lastSynced: new Date()
          });
          order = existingOrder;
        } else {
          // Create new order
          order = manager.create(SupplierOrder, {
            ...orderData,
            lastSynced: new Date()
          });
          order = await manager.save(order);
          ordersCreated++;
        }

        // Sync products
        // Delete existing products for full refresh
        await manager.delete(OrderProduct, { orderId: order.id });

        // Insert new products
        for (const productData of orderData.products) {
          const product = manager.create(OrderProduct, {
            ...productData,
            orderId: order.id,
            lastSynced: new Date()
          });
          await manager.save(product);
          productsCreated++;
        }
      }
    });

    return { ordersCreated, productsCreated };
  }

  /**
   * Get order statistics by supplier
   */
  async getOrderStatsBySupplier(): Promise<any[]> {
    const query = `
      SELECT 
        s.company_name as supplierName,
        s.id as supplierId,
        COUNT(DISTINCT o.id) as totalOrders,
        COUNT(DISTINCT CASE WHEN o.status = 'bestellt' THEN o.id END) as orderedCount,
        COUNT(DISTINCT CASE WHEN o.status = 'geliefert' THEN o.id END) as deliveredCount,
        COUNT(DISTINCT CASE WHEN o.status = 'teilgeliefert' THEN o.id END) as partialCount,
        COUNT(DISTINCT CASE WHEN o.status = 'storniert' THEN o.id END) as cancelledCount,
        COUNT(DISTINCT r.id) as totalReturns,
        SUM(p.quantity * p.price) as totalValue
      FROM suppliers s
      LEFT JOIN supplier_orders o ON s.jtl_id = o.jtl_supplier_id
      LEFT JOIN order_products p ON o.id = p.orderId
      LEFT JOIN supplier_returns r ON o.id = r.orderId
      WHERE s.company_name IS NOT NULL
      GROUP BY s.id, s.company_name
      ORDER BY totalOrders DESC
    `;

    return this.executeRawQuery(query);
  }

  /**
   * Search orders with complex criteria
   */
  async searchOrders(criteria: {
    orderNumber?: string;
    supplierName?: string;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SupplierOrder[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (criteria.orderNumber) {
      conditions.push('o.orderNumber LIKE ?');
      params.push(`%${criteria.orderNumber}%`);
    }

    if (criteria.supplierName) {
      conditions.push('o.supplierName LIKE ?');
      params.push(`%${criteria.supplierName}%`);
    }

    if (criteria.status) {
      conditions.push('o.status = ?');
      params.push(criteria.status);
    }

    if (criteria.startDate && criteria.endDate) {
      conditions.push('o.orderDate BETWEEN ? AND ?');
      params.push(criteria.startDate.toISOString(), criteria.endDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        o.*,
        json_group_array(
          json_object(
            'id', p.id,
            'productName', p.productName,
            'quantity', p.quantity,
            'price', p.price,
            'sku', p.sku
          )
        ) as products
      FROM supplier_orders o
      LEFT JOIN order_products p ON o.id = p.orderId
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.orderDate DESC
      LIMIT 100
    `;

    const results = this.executeRawQuery<any>(query, params);
    
    return results.map(row => ({
      ...row,
      products: JSON.parse(row.products)
    }));
  }
}

/**
 * Repository for sync status tracking
 */
export class SyncStatusRepository extends BaseRepository<SyncStatus> {
  constructor() {
    super(SyncStatus);
  }

  /**
   * Update sync status for an entity type
   */
  async updateSyncStatus(
    entityType: string, 
    recordsSynced: number, 
    status: string = 'success',
    errorMessage?: string
  ): Promise<void> {
    const existing = await this.findOne({ where: { entityType } });
    
    if (existing) {
      await this.update(existing.id, {
        lastSuccessfulSync: status === 'success' ? new Date() : existing.lastSuccessfulSync,
        recordsSynced: recordsSynced,
        status: status,
        errorMessage: errorMessage || undefined,
        lastAttempt: new Date()
      });
    } else {
      await this.save({
        entityType,
        lastSuccessfulSync: status === 'success' ? new Date() : undefined,
        recordsSynced: recordsSynced,
        status: status,
        errorMessage: errorMessage || undefined,
        lastAttempt: new Date()
      });
    }
  }

  /**
   * Get sync status summary
   */
  async getSyncSummary(): Promise<SyncStatus[]> {
    return this.findAll({
      order: { entityType: 'ASC' }
    });
  }

  /**
   * Check if sync is needed (last sync > 1 hour ago)
   */
  async isSyncNeeded(entityType: string): Promise<boolean> {
    const status = await this.findOne({ where: { entityType } });
    
    if (!status || !status.lastSuccessfulSync) {
      return true;
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return status.lastSuccessfulSync < oneHourAgo;
  }
}