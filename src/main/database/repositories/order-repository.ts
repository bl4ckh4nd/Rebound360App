import { BaseRepository } from './base-repository';
import { SupplierOrder } from '../entities/jtl/SupplierOrder';
import { OrderProduct } from '../entities/jtl/OrderProduct';
import { Order } from '../../../shared/types';

/**
 * Repository for SupplierOrder entity with hybrid approach
 * Extends JTL sync capabilities with additional business logic for order management
 */
export class OrderRepository extends BaseRepository<SupplierOrder> {
  constructor() {
    super(SupplierOrder);
  }

  /**
   * Get all orders with optional filtering
   */
  async getAllOrders(filters?: {
    status?: string;
    supplierName?: string;
    orderNumber?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Order[]> {
    try {
      let whereConditions: string[] = ['1=1'];
      const params: any[] = [];

      if (filters?.status) {
        whereConditions.push('o.status = ?');
        params.push(filters.status);
      }

      if (filters?.supplierName) {
        whereConditions.push('o.supplierName LIKE ?');
        params.push(`%${filters.supplierName}%`);
      }

      if (filters?.orderNumber) {
        whereConditions.push('o.orderNumber LIKE ?');
        params.push(`%${filters.orderNumber}%`);
      }

      if (filters?.startDate && filters?.endDate) {
        whereConditions.push('o.orderDate BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }

      const query = `
        SELECT 
          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, 
          o.supplierName, o.status, o.deliveryDate, o.supplierReference, 
          o.last_synced,
          json_group_array(
            json_object(
              'id', COALESCE(p.id, 0),
              'jtl_id', p.jtl_id,
              'jtl_article_id', p.jtl_article_id,
              'productName', p.productName,
              'quantity', p.quantity,
              'price', p.price,
              'sku', p.sku
            )
          ) as products
        FROM supplier_orders o
        LEFT JOIN order_products p ON o.jtl_id = p.orderId
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY o.jtl_id
        ORDER BY o.orderDate DESC
      `;

      const results = this.executeRawQuery<any>(query, params);
      
      return results.map(row => ({
        jtl_id: row.jtl_id,
        orderNumber: row.orderNumber,
        orderDate: row.orderDate,
        jtl_supplier_id: row.jtl_supplier_id,
        supplierName: row.supplierName,
        status: row.status,
        deliveryDate: row.deliveryDate,
        supplierReference: row.supplierReference,
        last_synced: row.last_synced,
        products: row.products ? JSON.parse(row.products).filter((p: any) => p.jtl_id !== null) : [],
        notes: [],
        documents: []
      }));
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  }

  /**
   * Get order by JTL ID with full details
   */
  async getOrderByJtlId(jtlId: number): Promise<Order | null> {
    try {
      const query = `
        SELECT 
          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, 
          o.supplierName, o.status, o.deliveryDate, o.supplierReference, 
          o.last_synced
        FROM supplier_orders o
        WHERE o.jtl_id = ?
      `;

      const orderResults = this.executeRawQuery<any>(query, [jtlId]);
      
      if (orderResults.length === 0) {
        return null;
      }

      const order = orderResults[0];
      
      // Get products for this order
      const productsQuery = `
        SELECT 
          id, jtl_id, jtl_article_id, productName, 
          quantity, price, sku
        FROM order_products 
        WHERE orderId = ?
      `;

      const products = this.executeRawQuery<any>(productsQuery, [jtlId]);

      return {
        jtl_id: order.jtl_id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        jtl_supplier_id: order.jtl_supplier_id,
        supplierName: order.supplierName,
        status: order.status,
        deliveryDate: order.deliveryDate,
        supplierReference: order.supplierReference,
        last_synced: order.last_synced,
        products: products.map(p => ({
          id: p.id || 0,
          jtl_id: p.jtl_id,
          jtl_article_id: p.jtl_article_id,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
          sku: p.sku
        })),
        notes: [],
        documents: []
      };
    } catch (error) {
      console.error('Error in getOrderByJtlId:', error);
      throw error;
    }
  }

  /**
   * Search orders with advanced criteria
   */
  async searchOrders(searchTerm: string): Promise<Order[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      
      const query = `
        SELECT 
          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, 
          o.supplierName, o.status, o.deliveryDate, o.supplierReference, 
          o.last_synced,
          json_group_array(
            CASE WHEN p.jtl_id IS NOT NULL THEN
              json_object(
                'id', COALESCE(p.id, 0),
                'jtl_id', p.jtl_id,
                'jtl_article_id', p.jtl_article_id,
                'productName', p.productName,
                'quantity', p.quantity,
                'price', p.price,
                'sku', p.sku
              )
            END
          ) as products
        FROM supplier_orders o
        LEFT JOIN order_products p ON o.jtl_id = p.orderId
        WHERE 
          o.orderNumber LIKE ? OR
          o.supplierName LIKE ? OR
          o.supplierReference LIKE ? OR
          p.productName LIKE ? OR
          p.sku LIKE ?
        GROUP BY o.jtl_id
        ORDER BY 
          CASE 
            WHEN o.orderNumber LIKE ? THEN 1
            WHEN o.supplierName LIKE ? THEN 2
            ELSE 3
          END,
          o.orderDate DESC
        LIMIT 50
      `;

      const results = this.executeRawQuery<any>(query, [
        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
        searchPattern, searchPattern
      ]);

      return results.map(row => ({
        jtl_id: row.jtl_id,
        orderNumber: row.orderNumber,
        orderDate: row.orderDate,
        jtl_supplier_id: row.jtl_supplier_id,
        supplierName: row.supplierName,
        status: row.status,
        deliveryDate: row.deliveryDate,
        supplierReference: row.supplierReference,
        last_synced: row.last_synced,
        products: row.products ? JSON.parse(row.products).filter((p: any) => p !== null) : [],
        notes: [],
        documents: []
      }));
    } catch (error) {
      console.error('Error in searchOrders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(jtlId: number, status: string): Promise<boolean> {
    try {
      const query = `
        UPDATE supplier_orders
        SET status = ?, last_synced = ?
        WHERE jtl_id = ?
      `;

      const result = this.executeRawCommand(query, [
        status, 
        new Date().toISOString(), 
        jtlId
      ]);

      return result.changes > 0;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  /**
   * Get order statistics and metrics
   */
  async getOrderStatistics(): Promise<{
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    ordersWithProducts: number;
    ordersWithReturns: number;
    recentlyUpdated: number;
    totalValue: number;
  }> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT o.jtl_id) as totalOrders,
          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN o.jtl_id END) as ordersWithProducts,
          COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN o.jtl_id END) as ordersWithReturns,
          COUNT(DISTINCT CASE WHEN o.last_synced > datetime('now', '-7 days') THEN o.jtl_id END) as recentlyUpdated,
          COALESCE(SUM(p.quantity * p.price), 0) as totalValue
        FROM supplier_orders o
        LEFT JOIN order_products p ON o.jtl_id = p.orderId
        LEFT JOIN supplier_returns sr ON o.jtl_id = sr.orderId
      `;

      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM supplier_orders
        GROUP BY status
      `;

      const statsResults = this.executeRawQuery<any>(statsQuery);
      const statusResults = this.executeRawQuery<any>(statusQuery);

      const ordersByStatus: Record<string, number> = {};
      statusResults.forEach(row => {
        ordersByStatus[row.status] = row.count;
      });

      if (statsResults.length > 0) {
        const stats = statsResults[0];
        return {
          totalOrders: stats.totalOrders || 0,
          ordersByStatus,
          ordersWithProducts: stats.ordersWithProducts || 0,
          ordersWithReturns: stats.ordersWithReturns || 0,
          recentlyUpdated: stats.recentlyUpdated || 0,
          totalValue: stats.totalValue || 0
        };
      }

      return {
        totalOrders: 0,
        ordersByStatus,
        ordersWithProducts: 0,
        ordersWithReturns: 0,
        recentlyUpdated: 0,
        totalValue: 0
      };
    } catch (error) {
      console.error('Error in getOrderStatistics:', error);
      throw error;
    }
  }

  /**
   * Get orders by supplier with aggregated data
   */
  async getOrdersBySupplier(jtlSupplierId?: number): Promise<Array<Order & {
    productCount: number;
    returnCount: number;
  }>> {
    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (jtlSupplierId) {
        whereClause = 'o.jtl_supplier_id = ?';
        params.push(jtlSupplierId);
      }

      const query = `
        SELECT 
          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, 
          o.supplierName, o.status, o.deliveryDate, o.supplierReference, 
          o.last_synced,
          COUNT(DISTINCT p.id) as productCount,
          COUNT(DISTINCT sr.id) as returnCount,
          json_group_array(
            CASE WHEN p.jtl_id IS NOT NULL THEN
              json_object(
                'id', COALESCE(p.id, 0),
                'jtl_id', p.jtl_id,
                'jtl_article_id', p.jtl_article_id,
                'productName', p.productName,
                'quantity', p.quantity,
                'price', p.price,
                'sku', p.sku
              )
            END
          ) as products
        FROM supplier_orders o
        LEFT JOIN order_products p ON o.jtl_id = p.orderId
        LEFT JOIN supplier_returns sr ON o.jtl_id = sr.orderId
        WHERE ${whereClause}
        GROUP BY o.jtl_id
        ORDER BY o.orderDate DESC
      `;

      const results = this.executeRawQuery<any>(query, params);

      return results.map(row => ({
        jtl_id: row.jtl_id,
        orderNumber: row.orderNumber,
        orderDate: row.orderDate,
        jtl_supplier_id: row.jtl_supplier_id,
        supplierName: row.supplierName,
        status: row.status,
        deliveryDate: row.deliveryDate,
        supplierReference: row.supplierReference,
        last_synced: row.last_synced,
        products: row.products ? JSON.parse(row.products).filter((p: any) => p !== null) : [],
        notes: [],
        documents: [],
        productCount: row.productCount || 0,
        returnCount: row.returnCount || 0
      }));
    } catch (error) {
      console.error('Error in getOrdersBySupplier:', error);
      throw error;
    }
  }

  /**
   * Get orders needing sync (not synced in last 24 hours)
   */
  async getOrdersNeedingSync(): Promise<Order[]> {
    try {
      const query = `
        SELECT 
          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, 
          o.supplierName, o.status, o.deliveryDate, o.supplierReference, 
          o.last_synced
        FROM supplier_orders o
        WHERE 
          o.last_synced IS NULL OR 
          o.last_synced < datetime('now', '-24 hours')
        ORDER BY o.last_synced ASC NULLS FIRST
      `;

      const results = this.executeRawQuery<any>(query);

      return results.map(row => ({
        jtl_id: row.jtl_id,
        orderNumber: row.orderNumber,
        orderDate: row.orderDate,
        jtl_supplier_id: row.jtl_supplier_id,
        supplierName: row.supplierName,
        status: row.status,
        deliveryDate: row.deliveryDate,
        supplierReference: row.supplierReference,
        last_synced: row.last_synced,
        products: [],
        notes: [],
        documents: []
      }));
    } catch (error) {
      console.error('Error in getOrdersNeedingSync:', error);
      throw error;
    }
  }

  /**
   * Transform TypeORM entity to shared type
   */
  entityToDTO(entity: SupplierOrder): Order {
    return {
      jtl_id: entity.jtlId || 0,
      orderNumber: entity.orderNumber,
      orderDate: entity.orderDate,
      jtl_supplier_id: entity.jtlSupplierId || 0,
      supplierName: entity.supplierName,
      status: entity.status,
      deliveryDate: entity.deliveryDate,
      supplierReference: entity.supplierReference,
      last_synced: entity.lastSynced?.toISOString() || '',
      products: (entity.products || []).map(p => ({
        id: p.id || 0,
        jtl_id: p.jtlId || 0,
        jtl_article_id: p.jtlArticleId || 0,
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
        sku: p.sku || ''
      })),
      notes: [],
      documents: []
    };
  }

  /**
   * Transform array of TypeORM entities to shared types
   */
  entitiesToDTOs(entities: SupplierOrder[]): Order[] {
    return entities.map(entity => this.entityToDTO(entity));
  }
}