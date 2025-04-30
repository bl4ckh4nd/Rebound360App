import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsApi } from '../../shared/api/settings-api';
import {
  DatabaseSettings,
  FollowUpAction,
  ReturnReason,
  ReasonCategory,
  StatusWorkflow,
  CustomField,
  StatusStep
} from '../../shared/types';

// Query keys
export const SETTINGS_KEYS = {
  database: ['settings', 'database'],
  workflows: ['settings', 'workflows'],
  workflow: (id?: string) => ['settings', 'workflows', id],
  workflowByAction: (action?: string) => ['settings', 'workflows', 'action', action],
  categories: ['settings', 'categories'],
  category: (id?: string) => ['settings', 'categories', id],
  reasons: ['settings', 'reasons'],
  reasonsByAction: (action?: string) => ['settings', 'reasons', 'action', action],
  reason: (id?: string) => ['settings', 'reasons', id],
  customFields: ['settings', 'customFields'],
  customField: (id?: string) => ['settings', 'customFields', id]
};

// Database settings hooks
export const useDatabaseSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.database,
    queryFn: async () => {
      console.log('Executing database settings query');
      const result = await SettingsApi.getDatabaseSettings();
      console.log('Database settings query result:', result);
      return result;
    }
  });
};

export const useUpdateDatabaseSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<DatabaseSettings>) => SettingsApi.updateDatabaseSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.database });
    }
  });
};

export const useTestDatabaseConnection = () => {
  return useMutation({
    mutationFn: (settings: DatabaseSettings) => SettingsApi.testDatabaseConnection(settings)
  });
};

// Workflow hooks
export const useWorkflows = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.workflows,
    queryFn: SettingsApi.getWorkflows
  });
};

export const useWorkflow = (id?: string) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.workflow(id),
    queryFn: () => SettingsApi.getWorkflowById(id!),
    enabled: !!id
  });
};

// Default status colors for when no workflow is defined
const defaultStatusColors: Record<string, string> = {
  'ausstehend': '#ffc107', // yellow
  'beauftragt': '#8a2be2', // purple
  'versandt': '#0d6efd',   // blue
  'abgeschlossen': '#198754', // green
  'gutgeschrieben': '#6610f2' // indigo
};

// Fallback workflow generator for when the API fails
export const generateFallbackWorkflow = (action: FollowUpAction): StatusWorkflow => {
  const commonSteps = [
    {
      id: '1',
      name: 'ausstehend',
      description: 'Retoure wurde angelegt',
      color: defaultStatusColors['ausstehend'],
      order: 1,
      requiredFields: ['orderNumber'],
      workflowId: `fallback-${action}`
    },
    {
      id: '2',
      name: 'beauftragt',
      description: 'Retoure wurde beauftragt',
      color: defaultStatusColors['beauftragt'],
      order: 2,
      requiredFields: ['commissioningDate'],
      workflowId: `fallback-${action}`
    },
    {
      id: '3',
      name: 'versandt',
      description: 'Retoure wurde versendet',
      color: defaultStatusColors['versandt'],
      order: 3,
      requiredFields: ['shippingDate'],
      workflowId: `fallback-${action}`
    }
  ];

  // Add action-specific final steps
  let finalSteps: StatusStep[] = [];
  if (action === 'gutschrift') {
    finalSteps = [
      {
        id: '4',
        name: 'gutgeschrieben',
        description: 'Gutschrift wurde erstellt',
        color: defaultStatusColors['gutgeschrieben'],
        order: 4,
        requiredFields: ['creditNoteNumber', 'creditAmount'],
        workflowId: `fallback-${action}`
      },
      {
        id: '5',
        name: 'abgeschlossen',
        description: 'Retoure abgeschlossen',
        color: defaultStatusColors['abgeschlossen'],
        order: 5,
        requiredFields: [],
        workflowId: `fallback-${action}`
      }
    ];
  } else {
    finalSteps = [
      {
        id: '4',
        name: 'abgeschlossen',
        description: 'Retoure abgeschlossen',
        color: defaultStatusColors['abgeschlossen'],
        order: 4,
        requiredFields: [],
        workflowId: `fallback-${action}`
      }
    ];
  }

  return {
    id: `fallback-${action}`,
    name: `Standard ${action} Workflow`,
    followUpAction: action,
    steps: [...commonSteps, ...finalSteps],
    isDefault: true,
    workflowType: 'return'
  };
};

export const useWorkflowByAction = (action?: FollowUpAction) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.workflowByAction(action),
    queryFn: async () => {
      if (!action) return null;
      try {
        const result = await SettingsApi.getWorkflowByAction(action);
        return result;
      } catch (error) {
        console.warn(`Workflow for action "${action}" not found, using fallback workflow`);
        return generateFallbackWorkflow(action);
      }
    },
    enabled: !!action
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workflow: Omit<StatusWorkflow, 'id'>) => SettingsApi.createWorkflow(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.workflows });
    }
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, workflow }: { id: string; workflow: Partial<StatusWorkflow> }) => 
      SettingsApi.updateWorkflow(id, workflow),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.workflows });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.workflow(id) });
    }
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SettingsApi.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.workflows });
    }
  });
};

// Reason category hooks
export const useCategories = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.categories,
    queryFn: SettingsApi.getCategories
  });
};

export const useCategory = (id?: string) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.category(id),
    queryFn: () => SettingsApi.getCategoryById(id!),
    enabled: !!id
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (category: Omit<ReasonCategory, 'id'>) => SettingsApi.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.categories });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<ReasonCategory> }) => 
      SettingsApi.updateCategory(id, category),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.category(id) });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SettingsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.categories });
    }
  });
};

// Return reason hooks
export const useReasons = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.reasons,
    queryFn: SettingsApi.getReasons
  });
};

export const useReasonsByAction = (action?: FollowUpAction) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.reasonsByAction(action),
    queryFn: () => SettingsApi.getReasonsByAction(action!),
    enabled: !!action
  });
};

export const useReason = (id?: string) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.reason(id),
    queryFn: () => SettingsApi.getReasonById(id!),
    enabled: !!id
  });
};

export const useCreateReason = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reason: Omit<ReturnReason, 'id'>) => SettingsApi.createReason(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.reasons });
    }
  });
};

export const useUpdateReason = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: Partial<ReturnReason> }) => 
      SettingsApi.updateReason(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.reasons });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.reason(id) });
    }
  });
};

export const useDeleteReason = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SettingsApi.deleteReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.reasons });
    }
  });
};

// Custom field hooks
export const useCustomFields = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.customFields,
    queryFn: SettingsApi.getCustomFields
  });
};

export const useCustomField = (id?: string) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.customField(id),
    queryFn: () => SettingsApi.getCustomFieldById(id!),
    enabled: !!id
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (field: Omit<CustomField, 'id'>) => SettingsApi.createCustomField(field),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.customFields });
    }
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, field }: { id: string; field: Partial<CustomField> }) => 
      SettingsApi.updateCustomField(id, field),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.customFields });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.customField(id) });
    }
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SettingsApi.deleteCustomField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.customFields });
    }
  });
};