import type { Order } from '../types';
import { apiClient } from './api-client';

export class OrdersApi {
  /**
   * Get all orders
   */
  static async getAll(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders');
  }

  /**
   * Get order by ID
   */
  static async getById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  }

  /**
   * Create a new order
   */
  static async create(orderData: Omit<Order, 'id'>): Promise<Order> {
    return apiClient.post<Order>('/orders', orderData);
  }

  /**
   * Update an order
   */
  static async update(id: string, orderData: Partial<Order>): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${id}`, orderData);
  }

  /**
   * Update order status
   */
  static async updateStatus(id: string, status: Order['status']): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status });
  }

  /**
   * Create a return from an order
   */
  static async createReturn(
    id: string, 
    data: { products: Array<{ id: string; quantity: number; reason: string }> }
  ): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/create-return`, data);
  }

  /**
   * Delete an order
   */
  static async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/orders/${id}`);
  }
}
