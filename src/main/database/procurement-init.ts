import { v4 as uuidv4 } from 'uuid';
import { StatusWorkflow } from '../../shared/types';

export const defaultProcurementWorkflow: Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
  name: "Standard-Beschaffungsablauf",
  followUpAction: "procurement",
  workflowType: "procurement",
  isDefault: true,
  steps: [
    {
      id: uuidv4(),
      name: "Entwurf",
      description: "Bestellanforderung in Bearbeitung",
      color: "#9CA3AF",
      order: 0,
      requiredFields: ["title", "description", "items"],
      workflowId: ""
    },
    {
      id: uuidv4(),
      name: "Eingereicht",
      description: "Zur Genehmigung eingereicht",
      color: "#60A5FA",
      order: 1,
      requiredFields: ["department", "priority", "requesterName", "budgetCode"],
      workflowId: ""
    },
    {
      id: uuidv4(),
      name: "Abteilungsleiter-Genehmigung",
      description: "Wartet auf Genehmigung durch Abteilungsleitung",
      color: "#F59E0B",
      order: 2,
      requiredFields: [],
      workflowId: ""
    },
    {
      id: uuidv4(),
      name: "Finanzielle Genehmigung",
      description: "Wartet auf finanzielle Genehmigung",
      color: "#10B981",
      order: 3,
      requiredFields: ["totalAmount", "currency"],
      workflowId: ""
    },
    {
      id: uuidv4(),
      name: "Genehmigt",
      description: "Bereit zur Bestellung",
      color: "#34D399",
      order: 4,
      requiredFields: [],
      workflowId: ""
    }
  ]
};

export async function initializeProcurementWorkflow(createWorkflow: (workflow: Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>) {
  try {
    await createWorkflow(defaultProcurementWorkflow);
    console.log('Default procurement workflow initialized');
  } catch (error) {
    console.error('Error initializing procurement workflow:', error);
  }
}