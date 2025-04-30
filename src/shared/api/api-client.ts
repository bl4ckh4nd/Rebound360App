import { ApiResponse, ApiError } from '../types';

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://127.0.0.1:3001/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Handle API response
   * @param response Fetch response object
   * @returns Promise with parsed response data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('[apiClient handleResponse] Received response status:', response.status, 'ok:', response.ok);
    const contentType = response.headers.get('content-type');
    
    // Handle non-JSON responses (like 204 No Content)
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return undefined as T;
    }

    const rawData = await response.json();
    console.log('[apiClient handleResponse] Parsed rawData:', rawData);

    if (!response.ok) {
      const error = rawData as ApiError;
      console.error('[apiClient handleResponse] Response not OK, throwing error:', error);
      throw new Error(error.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    // Check if response is wrapped in data property
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      console.log('[apiClient handleResponse] Unwrapping data property.');
      return (rawData as ApiResponse<T>).data;
    }

    console.log('[apiClient handleResponse] Returning rawData directly.');
    return rawData as T;
  }

  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise with response data
   */
  async get<T>(endpoint: string, options = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Fetch options
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: any, options = {}): Promise<T> {
    console.log('[apiClient post] Sending POST to:', `${this.baseUrl}${endpoint}`, 'with data:', data);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    });

    const result = await this.handleResponse<T>(response);
    console.log('[apiClient post] Received result from handleResponse:', result);
    return result;
  }

  /**
   * Make a PUT request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Fetch options
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data: any, options = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a PATCH request
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Fetch options
   * @returns Promise with response data
   */
  async patch<T>(endpoint: string, data: any, options = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string, options = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload a file
   * @param endpoint API endpoint
   * @param formData FormData containing the file and other fields
   * @returns Promise with response data
   */
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, browser will set it with boundary
    });

    return this.handleResponse<T>(response);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();