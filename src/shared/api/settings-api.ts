import { apiClient } from './api-client';
import { 
  DatabaseSettings,
  StatusWorkflow,
  StatusStep,
  ReasonCategory,
  ReturnReason,
  FollowUpAction,
  CustomField
} from '../types';

const BASE_URL = '/settings';

interface ApiResponse<T> {
  data: T;
}

export class SettingsApi {
  // Database Settings
  static async getDatabaseSettings(): Promise<DatabaseSettings> {
    const response = await apiClient.get<DatabaseSettings>(`${BASE_URL}/database`);
    if (!response) {
      throw new Error('No data received from API');
    }
    return response;
  }

  static async updateDatabaseSettings(settings: Partial<DatabaseSettings>): Promise<DatabaseSettings> {
    const { data } = await apiClient.post<ApiResponse<DatabaseSettings>>(`${BASE_URL}/database`, settings);
    return data;
  }

  static async testDatabaseConnection(settings: DatabaseSettings): Promise<{ 
    success: boolean; 
    message: string; 
    lastConnectionTest: string;
  }> {
    console.log('[SettingsApi testDatabaseConnection] Calling apiClient.post with settings:', { ...settings, password: '****' });
    const result = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      lastConnectionTest: string; 
    }>(`${BASE_URL}/database/test`, settings);
    
    console.log('[SettingsApi testDatabaseConnection] Received result from apiClient:', result);
    if (!result) {
      throw new Error('API client returned undefined for database test connection.');
    }
    return result;
  }

  // Workflow Management
  static async getWorkflows(): Promise<StatusWorkflow[]> {
    const response = await apiClient.get<StatusWorkflow[]>(`${BASE_URL}/workflows`);
    if (!response) {
      throw new Error('No workflow data received from API');
    }
    return response;
  }

  static async getWorkflowById(id: string): Promise<StatusWorkflow> {
    const response = await apiClient.get<StatusWorkflow>(`${BASE_URL}/workflows/${id}`);
    if (!response) {
      throw new Error('No workflow data received from API');
    }
    return response;
  }

  static async getWorkflowByAction(action: FollowUpAction): Promise<StatusWorkflow> {
    const response = await apiClient.get<StatusWorkflow>(`${BASE_URL}/workflows/by-action/${action}`);
    if (!response) {
      throw new Error('No workflow data received for action');
    }
    return response;
  }

  static async createWorkflow(workflow: Omit<StatusWorkflow, 'id'>): Promise<StatusWorkflow> {
    const { data } = await apiClient.post<ApiResponse<StatusWorkflow>>(`${BASE_URL}/workflows`, workflow);
    return data;
  }

  static async updateWorkflow(id: string, workflow: Partial<StatusWorkflow>): Promise<StatusWorkflow> {
    const { data } = await apiClient.put<ApiResponse<StatusWorkflow>>(`${BASE_URL}/workflows/${id}`, workflow);
    return data;
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_URL}/workflows/${id}`);
  }

  // Reason Categories
  static async getCategories(): Promise<ReasonCategory[]> {
    const response = await apiClient.get<ReasonCategory[]>(`${BASE_URL}/reason-categories`);
    if (!response) {
      throw new Error('No category data received from API');
    }
    return response;
  }

  static async getCategoryById(id: string): Promise<ReasonCategory> {
    const response = await apiClient.get<ReasonCategory>(`${BASE_URL}/reason-categories/${id}`);
    if (!response) {
      throw new Error('No category data received from API');
    }
    return response;
  }

  static async createCategory(category: Omit<ReasonCategory, 'id'>): Promise<ReasonCategory> {
    const { data } = await apiClient.post<ApiResponse<ReasonCategory>>(`${BASE_URL}/reason-categories`, category);
    return data;
  }

  static async updateCategory(id: string, category: Partial<ReasonCategory>): Promise<ReasonCategory> {
    const { data } = await apiClient.put<ApiResponse<ReasonCategory>>(`${BASE_URL}/reason-categories/${id}`, category);
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_URL}/reason-categories/${id}`);
  }

  // Return Reasons
  static async getReasons(): Promise<ReturnReason[]> {
    const response = await apiClient.get<ReturnReason[]>(`${BASE_URL}/reasons`);
    if (!response) {
      throw new Error('No reason data received from API');
    }
    return response;
  }

  static async getReasonsByAction(action: FollowUpAction): Promise<ReturnReason[]> {
    const response = await apiClient.get<ReturnReason[]>(`${BASE_URL}/reasons/action/${action}`);
    if (!response) {
      throw new Error('No reason data received for action');
    }
    return response;
  }

  static async getReasonById(id: string): Promise<ReturnReason> {
    const response = await apiClient.get<ReturnReason>(`${BASE_URL}/reasons/${id}`);
    if (!response) {
      throw new Error('No reason data received from API');
    }
    return response;
  }

  static async createReason(reason: Omit<ReturnReason, 'id'>): Promise<ReturnReason> {
    const { data } = await apiClient.post<ApiResponse<ReturnReason>>(`${BASE_URL}/reasons`, reason);
    return data;
  }

  static async updateReason(id: string, reason: Partial<ReturnReason>): Promise<ReturnReason> {
    const { data } = await apiClient.put<ApiResponse<ReturnReason>>(`${BASE_URL}/reasons/${id}`, reason);
    return data;
  }

  static async deleteReason(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_URL}/reasons/${id}`);
  }

  // Custom Fields
  static async getCustomFields(): Promise<CustomField[]> {
    const response = await apiClient.get<CustomField[]>(`${BASE_URL}/custom-fields`);
    if (!response) {
      throw new Error('No custom fields data received from API');
    }
    return response;
  }

  static async getCustomFieldById(id: string): Promise<CustomField> {
    const response = await apiClient.get<CustomField>(`${BASE_URL}/custom-fields/${id}`);
    if (!response) {
      throw new Error('No custom field data received from API');
    }
    return response;
  }

  static async createCustomField(field: Omit<CustomField, 'id'>): Promise<CustomField> {
    const { data } = await apiClient.post<ApiResponse<CustomField>>(`${BASE_URL}/custom-fields`, field);
    return data;
  }

  static async updateCustomField(id: string, field: Partial<CustomField>): Promise<CustomField> {
    const { data } = await apiClient.put<ApiResponse<CustomField>>(`${BASE_URL}/custom-fields/${id}`, field);
    return data;
  }

  static async deleteCustomField(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_URL}/custom-fields/${id}`);
  }
}