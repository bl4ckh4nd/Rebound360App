import { apiClient } from './api-client';
import { Supplier } from '../types';

/**
 * Supplier API client for interacting with supplier endpoints
 */
export class SupplierApi {
  /**
   * Get all suppliers
   * @param filters Optional filters
   * @returns Promise with all suppliers
   */
  static async getSuppliers(filters?: Record<string, any>): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>('/suppliers', { params: filters });
    return response || [];
  }

  /**
   * Get supplier by ID
   * @param id Supplier ID
   * @returns Promise with supplier
   */
  static async getSupplierById(id: string): Promise<Supplier> {
    return apiClient.get<Supplier>(`/suppliers/${id}`);
  }

  /**
   * Create a new supplier
   * @param supplierData Supplier data to create
   * @returns Promise with created supplier
   */
  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return apiClient.post<Supplier>('/suppliers', supplierData);
  }

  /**
   * Update a supplier
   * @param supplier Supplier data to update
   * @returns Promise with updated supplier
   */
  static async updateSupplier(supplier: Supplier): Promise<Supplier> {
    return apiClient.put<Supplier>(`/suppliers/${supplier.jtl_id}`, supplier);
  }

  /**
   * Delete a supplier
   * @param id Supplier ID
   * @returns Promise with success information
   */
  static async deleteSupplier(id: string): Promise<void> {
    return apiClient.delete<void>(`/suppliers/${id}`);
  }
}