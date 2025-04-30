import { apiClient } from './api-client';
import { ReturnItem, Document, ReturnStatus, DocumentUploadRequest, CreateReturnFromOrderData } from '../types';

/**
 * Returns API client for interacting with returns endpoints
 */
export class ReturnsApi {
  /**
   * Get all returns
   * @returns Promise with all returns
   */
  static async getAll(): Promise<ReturnItem[]> {
    return apiClient.get<ReturnItem[]>('/returns');
  }

  /**
   * Get a return by ID
   * @param id Return ID
   * @returns Promise with return item
   */
  static async getById(id: string): Promise<ReturnItem> {
    return apiClient.get<ReturnItem>(`/returns/${id}`);
  }

  /**
   * Create a new return
   * @param returnData Return data to create
   * @returns Promise with created return
   */
  static async create(returnData: Partial<ReturnItem>): Promise<ReturnItem> {
    return apiClient.post<ReturnItem>('/returns', returnData);
  }

  /**
   * Create a draft return for document uploads
   * @returns Promise with created draft return
   */
  static async createDraft(): Promise<ReturnItem> {
    return apiClient.post<ReturnItem>('/returns/draft', {
      orderNumber: '',
      followUpAction: 'gutschrift',
      supplierReference: '',
      products: []
    });
  }

  /**
   * Update a draft return
   * @param id Return ID
   * @param returnData Return data to update
   * @returns Promise with updated return
   */
  static async updateDraft(id: string, returnData: Partial<ReturnItem>): Promise<ReturnItem> {
    return apiClient.patch<ReturnItem>(`/returns/${id}/draft`, returnData);
  }

  /**
   * Delete a draft return and its associated documents
   * @param id Return ID
   * @returns Promise with deletion result
   */
  static async deleteDraft(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/returns/${id}/draft`);
  }

  /**
   * Update return status
   * @param id Return ID
   * @param status New status
   * @returns Promise with updated return
   */
  static async updateStatus(id: string, status: ReturnStatus): Promise<ReturnItem> {
    return apiClient.patch<ReturnItem>(`/returns/${id}`, { status });
  }

  /**
   * Add a note to a return
   * @param id Return ID
   * @param content Note content
   * @param author Note author
   * @returns Promise with updated return
   */
  static async addNote(id: string, content: string, author: string): Promise<ReturnItem> {
    return apiClient.post<ReturnItem>(`/returns/${id}/notes`, { content, author });
  }

  /**
   * Update a return
   * @param id Return ID
   * @param returnData Return data to update
   * @returns Promise with updated return
   */
  static async update(id: string, returnData: Partial<ReturnItem>): Promise<ReturnItem> {
    return apiClient.patch<ReturnItem>(`/returns/${id}`, returnData);
  }

  /**
   * Delete a return
   * @param id Return ID
   * @returns Promise indicating success
   */
  static async delete(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/returns/${id}`);
  }

  /**
   * Get all documents for a return
   * @param returnId Return ID
   * @returns Promise with documents array
   */
  static async getDocuments(returnId: string): Promise<Document[]> {
    return apiClient.get<Document[]>(`/returns/${returnId}/documents`);
  }

  /**
   * Upload a document for a return
   * @param returnId Return ID
   * @param file File to upload
   * @param description Optional document description
   * @returns Promise with uploaded document
   */
  static async uploadDocument(returnId: string, file: File, description?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return apiClient.uploadFile<Document>(`/returns/${returnId}/documents`, formData);
  }

  /**
   * Delete a document
   * @param returnId Return ID
   * @param documentId Document ID
   * @returns Promise with deletion result
   */
  static async deleteDocument(returnId: string, documentId: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`/returns/${returnId}/documents/${documentId}`);
  }

  /**
   * Creates a new return based on data from an existing order.
   * @param data Data containing the original order ID, products to return, and return details.
   * @returns Promise with the newly created return item.
   */
  static async createFromOrder(data: CreateReturnFromOrderData): Promise<ReturnItem> {
    return apiClient.post<ReturnItem>('/returns/from-order', data);
  }
}
