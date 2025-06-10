import { BaseRepository } from './base-repository';
import { Supplier } from '../entities/jtl/Supplier';
import { Supplier as SupplierType } from '../../../shared/types';

/**
 * Repository for Supplier entity with hybrid approach
 * Extends JTL sync capabilities with additional business logic
 */
export class SupplierRepository extends BaseRepository<Supplier> {
  constructor() {
    super(Supplier);
  }

  /**
   * Get all suppliers with optional filtering
   */
  async getAllSuppliers(filters?: {
    companyName?: string;
    status?: string;
    category?: string;
  }): Promise<SupplierType[]> {
    try {
      let whereConditions: string[] = ['1=1'];
      const params: any[] = [];

      if (filters?.companyName) {
        whereConditions.push('company_name LIKE ?');
        params.push(`%${filters.companyName}%`);
      }

      const query = `
        SELECT 
          jtl_id, supplier_number, company_name, company_addition, 
          contact, phone, phone_direct, fax, email, city, country, 
          postal_code, street, customer_number, notes, last_synced
        FROM suppliers 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY company_name ASC
      `;

      const results = this.executeRawQuery<any>(query, params);
      
      // Transform to shared types format
      return results.map(row => ({
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
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier by JTL ID
   */
  async getSupplierByJtlId(jtlId: number): Promise<SupplierType | null> {
    try {
      const query = `
        SELECT 
          jtl_id, supplier_number, company_name, company_addition,
          contact, phone, phone_direct, fax, email, city, country,
          postal_code, street, customer_number, notes, last_synced
        FROM suppliers 
        WHERE jtl_id = ?
      `;

      const results = this.executeRawQuery<any>(query, [jtlId]);
      
      if (results.length === 0) {
        return null;
      }

      const row = results[0];
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
    } catch (error) {
      console.error('Error in getSupplierByJtlId:', error);
      throw error;
    }
  }

  /**
   * Get supplier by supplier number
   */
  async getSupplierByNumber(supplierNumber: string): Promise<SupplierType | null> {
    try {
      const query = `
        SELECT 
          jtl_id, supplier_number, company_name, company_addition,
          contact, phone, phone_direct, fax, email, city, country,
          postal_code, street, customer_number, notes, last_synced
        FROM suppliers 
        WHERE supplier_number = ?
      `;

      const results = this.executeRawQuery<any>(query, [supplierNumber]);
      
      if (results.length === 0) {
        return null;
      }

      const row = results[0];
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
    } catch (error) {
      console.error('Error in getSupplierByNumber:', error);
      throw error;
    }
  }

  /**
   * Search suppliers with TypeORM query builder
   */
  async searchSuppliers(searchTerm: string): Promise<SupplierType[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      
      const query = `
        SELECT 
          jtl_id, supplier_number, company_name, company_addition,
          contact, phone, phone_direct, fax, email, city, country,
          postal_code, street, customer_number, notes, last_synced
        FROM suppliers
        WHERE 
          company_name LIKE ? OR
          supplier_number LIKE ? OR
          contact LIKE ? OR
          email LIKE ? OR
          city LIKE ?
        ORDER BY 
          CASE 
            WHEN company_name LIKE ? THEN 1
            WHEN supplier_number LIKE ? THEN 2
            ELSE 3
          END,
          company_name ASC
        LIMIT 50
      `;

      const results = this.executeRawQuery<any>(query, [
        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
        searchPattern, searchPattern
      ]);

      return results.map(row => ({
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
    } catch (error) {
      console.error('Error in searchSuppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier statistics and metrics
   */
  async getSupplierStatistics(): Promise<{
    totalSuppliers: number;
    suppliersWithOrders: number;
    suppliersWithReturns: number;
    recentlyUpdated: number;
  }> {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT s.jtl_id) as totalSuppliers,
          COUNT(DISTINCT CASE WHEN so.id IS NOT NULL THEN s.jtl_id END) as suppliersWithOrders,
          COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN s.jtl_id END) as suppliersWithReturns,
          COUNT(DISTINCT CASE WHEN s.last_synced > datetime('now', '-7 days') THEN s.jtl_id END) as recentlyUpdated
        FROM suppliers s
        LEFT JOIN supplier_orders so ON s.jtl_id = so.jtl_supplier_id
        LEFT JOIN supplier_returns sr ON so.id = sr.orderId
      `;

      const results = this.executeRawQuery<any>(query);
      
      if (results.length > 0) {
        const row = results[0];
        return {
          totalSuppliers: row.totalSuppliers || 0,
          suppliersWithOrders: row.suppliersWithOrders || 0,
          suppliersWithReturns: row.suppliersWithReturns || 0,
          recentlyUpdated: row.recentlyUpdated || 0
        };
      }

      return {
        totalSuppliers: 0,
        suppliersWithOrders: 0,
        suppliersWithReturns: 0,
        recentlyUpdated: 0
      };
    } catch (error) {
      console.error('Error in getSupplierStatistics:', error);
      throw error;
    }
  }

  /**
   * Get suppliers with their order summary
   */
  async getSuppliersWithOrderSummary(): Promise<Array<SupplierType & {
    orderCount: number;
    returnCount: number;
    lastOrderDate?: string;
  }>> {
    try {
      const query = `
        SELECT 
          s.jtl_id, s.supplier_number, s.company_name, s.company_addition,
          s.contact, s.phone, s.phone_direct, s.fax, s.email, s.city, 
          s.country, s.postal_code, s.street, s.customer_number, 
          s.notes, s.last_synced,
          COUNT(DISTINCT so.id) as orderCount,
          COUNT(DISTINCT sr.id) as returnCount,
          MAX(so.order_date) as lastOrderDate
        FROM suppliers s
        LEFT JOIN supplier_orders so ON s.jtl_id = so.jtl_supplier_id
        LEFT JOIN supplier_returns sr ON so.id = sr.orderId
        GROUP BY s.jtl_id
        ORDER BY s.company_name ASC
      `;

      const results = this.executeRawQuery<any>(query);

      return results.map(row => ({
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
        last_synced: row.last_synced,
        orderCount: row.orderCount || 0,
        returnCount: row.returnCount || 0,
        lastOrderDate: row.lastOrderDate
      }));
    } catch (error) {
      console.error('Error in getSuppliersWithOrderSummary:', error);
      throw error;
    }
  }

  /**
   * Get suppliers needing sync (not synced in last 24 hours)
   */
  async getSuppliersNeedingSync(): Promise<SupplierType[]> {
    try {
      const query = `
        SELECT 
          jtl_id, supplier_number, company_name, company_addition,
          contact, phone, phone_direct, fax, email, city, country,
          postal_code, street, customer_number, notes, last_synced
        FROM suppliers
        WHERE 
          last_synced IS NULL OR 
          last_synced < datetime('now', '-24 hours')
        ORDER BY last_synced ASC NULLS FIRST
      `;

      const results = this.executeRawQuery<any>(query);

      return results.map(row => ({
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
    } catch (error) {
      console.error('Error in getSuppliersNeedingSync:', error);
      throw error;
    }
  }

  /**
   * Transform TypeORM entity to shared type
   */
  entityToDTO(entity: Supplier): SupplierType {
    return {
      jtl_id: entity.jtlId || 0,
      supplier_number: entity.supplierNumber || '',
      company_name: entity.companyName || '',
      company_addition: entity.companyAddition || '',
      contact: entity.contact || '',
      phone: entity.phone || '',
      phone_direct: entity.phoneDirect || '',
      fax: entity.fax || '',
      email: entity.email || '',
      city: entity.city || '',
      country: entity.country || '',
      postal_code: entity.postalCode || '',
      street: entity.street || '',
      customer_number: entity.customerNumber || '',
      notes: entity.notes || '',
      last_synced: entity.lastSynced?.toISOString() || ''
    };
  }

  /**
   * Transform array of TypeORM entities to shared types
   */
  entitiesToDTOs(entities: Supplier[]): SupplierType[] {
    return entities.map(entity => this.entityToDTO(entity));
  }
}