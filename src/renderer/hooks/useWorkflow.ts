import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../shared/config';

export interface StatusStep {
  id: string;
  name: string;
  description: string;
  color: string;
  requiredFields: string[];
}

export interface Workflow {
  id: string;
  name: string;
  action: string;
  steps: StatusStep[];
}

// Default status colors for when no workflow is defined
const defaultStatusColors: Record<string, string> = {
  // Return statuses
  'ausstehend': '#ffc107', // yellow
  'beauftragt': '#8a2be2', // purple
  'versandt': '#0d6efd',   // blue
  'abgeschlossen': '#198754', // green
  'gutgeschrieben': '#6610f2', // indigo
  // Procurement statuses (add more as needed)
  'draft': '#6c757d', // secondary / gray
  'submitted': '#0dcaf0', // info / cyan
  'manager_approval': '#ffc107', // warning / yellow
  'finance_approval': '#8a2be2', // purple (same as beauftragt)
  'approved': '#198754', // success / green
  'rejected': '#dc3545', // danger / red
  'cancelled': '#dc3545', // danger / red
  'converted': '#6610f2'  // indigo (same as gutgeschrieben)
};

// Fallback workflow generator for when the API fails
const generateFallbackWorkflow = (action: string): Workflow | null => {
  if (action === 'procurement-requisition') {
    return {
      id: 'fallback-procurement-requisition',
      name: 'Standard Beschaffungsanforderung Workflow',
      action: action,
      steps: [
        { id: '1', name: 'draft', description: 'Anforderung erstellt', color: defaultStatusColors['draft'], requiredFields: [] },
        { id: '2', name: 'submitted', description: 'Zur Freigabe eingereicht', color: defaultStatusColors['submitted'], requiredFields: [] },
        // Add steps for manager/finance approval if multi-stage is planned
        // { id: '3', name: 'manager_approval', description: 'Wartet auf Manager-Freigabe', color: defaultStatusColors['manager_approval'], requiredFields: [] },
        // { id: '4', name: 'finance_approval', description: 'Wartet auf Finanz-Freigabe', color: defaultStatusColors['finance_approval'], requiredFields: [] },
        { id: '5', name: 'approved', description: 'Anforderung genehmigt', color: defaultStatusColors['approved'], requiredFields: [] },
        { id: '6', name: 'rejected', description: 'Anforderung abgelehnt', color: defaultStatusColors['rejected'], requiredFields: [] },
        { id: '7', name: 'converted', description: 'In Bestellung umgewandelt', color: defaultStatusColors['converted'], requiredFields: [] },
        // Add cancelled if needed
        // { id: '8', name: 'cancelled', description: 'Anforderung storniert', color: defaultStatusColors['cancelled'], requiredFields: [] },
      ]
    };
  }

  // --- Existing Return Workflow Logic ---
  const commonSteps = [
    {
      id: '1',
      name: 'ausstehend',
      description: 'Retoure wurde angelegt',
      color: defaultStatusColors['ausstehend'],
      requiredFields: ['orderNumber']
    },
    {
      id: '2',
      name: 'beauftragt',
      description: 'Retoure wurde beauftragt',
      color: defaultStatusColors['beauftragt'],
      requiredFields: ['commissioningDate']
    },
    {
      id: '3',
      name: 'versandt',
      description: 'Retoure wurde versendet',
      color: defaultStatusColors['versandt'],
      requiredFields: ['shippingDate']
    }
  ];

  let finalSteps: StatusStep[] = [];
  if (action === 'gutschrift') {
    finalSteps = [
      {
        id: '4',
        name: 'gutgeschrieben',
        description: 'Gutschrift wurde erstellt',
        color: defaultStatusColors['gutgeschrieben'],
        requiredFields: ['creditNoteNumber', 'creditAmount']
      },
      {
        id: '5',
        name: 'abgeschlossen',
        description: 'Retoure abgeschlossen',
        color: defaultStatusColors['abgeschlossen'],
        requiredFields: []
      }
    ];
  } else {
    finalSteps = [
      {
        id: '4',
        name: 'abgeschlossen',
        description: 'Retoure abgeschlossen',
        color: defaultStatusColors['abgeschlossen'],
        requiredFields: []
      }
    ];
  }

  // Only return workflow for known actions
  if (action === 'gutschrift' || action === 'ersatz' || action === 'reparatur' || action === 'ausschuss') {
    return {
      id: `fallback-${action}`,
      name: `Standard ${action} Workflow`,
      action,
      steps: [...commonSteps, ...finalSteps]
    };
  }

  return null; // Return null if action doesn't match known patterns
  // --- End Existing Return Workflow Logic ---
};

export function useWorkflowByAction(action?: string) {
  return useQuery<Workflow | null>({
    queryKey: ['workflow', action],
    queryFn: async () => {
      if (!action) return null;
      try {
        const response = await fetch(`${API_BASE_URL}/workflows/${action}`);
        if (!response.ok) {
          console.warn(`Workflow for action "${action}" not found or API error, using fallback.`);
          return generateFallbackWorkflow(action);
        }
        const data = await response.json();
        // TODO: Validate API response structure matches Workflow type
        return data as Workflow;
      } catch (error) {
        console.error('Error fetching workflow:', error);
        return generateFallbackWorkflow(action);
      }
    },
    enabled: !!action,
    // Consider adding staleTime if workflow definitions don't change often
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/workflows`);
        if (!response.ok) {
          console.warn('Failed to fetch workflows, returning empty array');
          return [];
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching workflows:', error);
        return [];
      }
    },
  });
} 