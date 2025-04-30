import { apiClient } from './api-client';
import { Requisition, PurchaseOrder } from '../types';

/**
 * Procurement API client for interacting with procurement endpoints
 */
export class ProcurementApi {
  /**
   * Get all requisitions
   * @param filters Optional filters
   * @returns Promise with all requisitions
   */
  static async getRequisitions(filters?: Record<string, any>): Promise<Requisition[]> {
    return apiClient.get<Requisition[]>('/procurement/requisitions', { params: filters });
  }

  /**
   * Get requisition by ID
   * @param id Requisition ID
   * @returns Promise with requisition
   */
  static async getRequisitionById(id: string): Promise<Requisition> {
    return apiClient.get<Requisition>(`/procurement/requisitions/${id}`);
  }

  /**
   * Create a new requisition
   * @param requisitionData Requisition data to create
   * @returns Promise with created requisition
   */
  static async createRequisition(requisitionData: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requisition> {
    return apiClient.post<Requisition>('/procurement/requisitions', requisitionData);
  }

  /**
   * Update a requisition
   * @param requisition Requisition data to update
   * @returns Promise with updated requisition
   */
  static async updateRequisition(requisition: Requisition): Promise<Requisition> {
    return apiClient.put<Requisition>(`/procurement/requisitions/${requisition.id}`, requisition);
  }

  /**
   * Delete a requisition
   * @param id Requisition ID
   * @returns Promise with success information
   */
  static async deleteRequisition(id: string): Promise<void> {
    return apiClient.delete<void>(`/procurement/requisitions/${id}`);
  }

  /**
   * Submit a requisition
   * @param requisitionId Requisition ID
   * @returns Promise with updated requisition
   */
  static async submitRequisition(requisitionId: string): Promise<Requisition> {
    return apiClient.post<Requisition>(`/procurement/requisitions/${requisitionId}/submit`, {});
  }

  /**
   * Approve a requisition
   * @param options Approval options
   * @returns Promise with updated requisition
   */
  static async approveRequisition({
    requisitionId,
    comment,
    approverId,
    approverName
  }: {
    requisitionId: string;
    comment?: string;
    approverId?: string;
    approverName?: string;
  }): Promise<Requisition> {
    return apiClient.post<Requisition>(`/procurement/requisitions/${requisitionId}/approve`, {
      comment,
      approverId,
      approverName
    });
  }

  /**
   * Reject a requisition
   * @param options Rejection options
   * @returns Promise with updated requisition
   */
  static async rejectRequisition({
    requisitionId,
    comment,
    rejectorId,
    rejectorName
  }: {
    requisitionId: string;
    comment: string;
    rejectorId?: string;
    rejectorName?: string;
  }): Promise<Requisition> {
    return apiClient.post<Requisition>(`/procurement/requisitions/${requisitionId}/reject`, {
      comment,
      rejectorId,
      rejectorName
    });
  }

  /**
   * Get all purchase orders
   * @param filters Optional filters
   * @returns Promise with all purchase orders
   */
  static async getPurchaseOrders(filters?: Record<string, any>): Promise<PurchaseOrder[]> {
    return apiClient.get<PurchaseOrder[]>('/procurement/purchase-orders', { params: filters });
  }

  /**
   * Get purchase order by ID
   * @param id Purchase order ID
   * @returns Promise with purchase order
   */
  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`/procurement/purchase-orders/${id}`);
  }

  /**
   * Create a new purchase order
   * @param purchaseOrderData Purchase order data to create
   * @returns Promise with created purchase order
   */
  static async createPurchaseOrder(purchaseOrderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/procurement/purchase-orders', purchaseOrderData);
  }

  /**
   * Update a purchase order
   * @param purchaseOrder Purchase order data to update
   * @returns Promise with updated purchase order
   */
  static async updatePurchaseOrder(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`/procurement/purchase-orders/${purchaseOrder.id}`, purchaseOrder);
  }

  /**
   * Delete a purchase order
   * @param id Purchase order ID
   * @returns Promise with success information
   */
  static async deletePurchaseOrder(id: string): Promise<void> {
    return apiClient.delete<void>(`/procurement/purchase-orders/${id}`);
  }

  /**
   * Convert a requisition to a purchase order
   * @param requisitionId ID of the requisition to convert 
   * @param options Extra options for conversion
   * @returns Promise with created purchase order
   */
  static async convertToPurchaseOrder(
    requisitionId: string,
    options: {
      billingAddress: {
        name: string;
        street: string;
        zipCode: string;
        city: string;
        country: string;
      };
      shippingAddress: {
        name: string;
        street: string;
        zipCode: string;
        city: string;
        country: string;
      };
    }
  ): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/procurement/requisitions/${requisitionId}/convert`, options);
  }
}