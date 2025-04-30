# Revised Implementation Plan: Dynamic Status System for Supplier Returns

## Problem Statement

There's a mismatch between the flexible workflow definition system in the UI and the rigid database schema. While users can define custom workflows with unique status steps in the UI, the database enforces a static set of statuses via a CHECK constraint:

```sql
status TEXT NOT NULL CHECK (status IN ('ausstehend', 'beauftragt', 'versandt', 'gutgeschrieben', 'abgeschlossen')),
```

This constraint prevents the application from using the custom workflows for actual returns.

## Required Changes Overview

1. Remove the status CHECK constraint in the database
2. Add reference to workflow and step in the supplier_returns table
3. Update backend API to handle dynamic status transitions
4. Modify frontend to support dynamic statuses

## Detailed File Changes

### 1. Database Schema (`src/main/database/db.ts`)

```typescript
// Remove the CHECK constraint and add workflow references
db.exec(`
  -- First add new columns for workflow references
  ALTER TABLE supplier_returns ADD COLUMN workflow_id TEXT REFERENCES status_workflows(id);
  ALTER TABLE supplier_returns ADD COLUMN status_step_id TEXT REFERENCES status_steps(id);

  -- Then create a new table without the CHECK constraint
  CREATE TABLE IF NOT EXISTS supplier_returns_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber TEXT,
    status TEXT NOT NULL, -- No CHECK constraint
    followUpAction TEXT NOT NULL CHECK (followUpAction IN ('gutschrift', 'ersatz', 'reparatur', 'ausschuss')),
    supplierReference TEXT,
    commissioningDate TEXT,
    shippingDate TEXT,
    creditNoteNumber TEXT,
    creditAmount REAL,
    originalInvoiceNumber TEXT,
    creditDate TEXT,
    creditNoteStatus TEXT CHECK (creditNoteStatus IN ('erstellt', 'abgestimmt')),
    reconciliationDate TEXT,
    reconciliationInvoiceNumber TEXT,
    orderId INTEGER,
    creditorNumber TEXT,
    customFields TEXT,
    workflow_id TEXT,
    status_step_id TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME,
    FOREIGN KEY (orderId) REFERENCES supplier_orders(id),
    FOREIGN KEY (workflow_id) REFERENCES status_workflows(id),
    FOREIGN KEY (status_step_id) REFERENCES status_steps(id)
  );
  
  -- Copy data from old table to new table, mapping statuses if needed
  INSERT INTO supplier_returns_new
  SELECT id, orderNumber, status, followUpAction, supplierReference, commissioningDate, 
         shippingDate, creditNoteNumber, creditAmount, originalInvoiceNumber, creditDate, 
         creditNoteStatus, reconciliationDate, reconciliationInvoiceNumber, orderId, 
         creditorNumber, customFields, NULL, NULL, createdAt, updatedAt
  FROM supplier_returns;
  
  -- Drop old table and rename new one
  DROP TABLE supplier_returns;
  ALTER TABLE supplier_returns_new RENAME TO supplier_returns;
`);

// Add migration to populate workflow_id and status_step_id for existing records
// This function will run once during application startup
export function migrateExistingReturnsToWorkflows() {
  // Get default workflows for each action type
  const defaultWorkflows = db.prepare(`
    SELECT id, follow_up_action FROM status_workflows WHERE is_default = 1
  `).all();
  
  // For each default workflow, find the matching step for existing statuses
  // and update the returns
  for (const workflow of defaultWorkflows) {
    // Get steps for this workflow
    const steps = db.prepare(`
      SELECT id, name FROM status_steps WHERE workflow_id = ?
      ORDER BY order_index
    `).all(workflow.id);
    
    // Map old statuses to step IDs based on name similarity
    const statusToStepMap = {
      'ausstehend': steps.find(s => s.name.toLowerCase().includes('aussteh'))?.id,
      'beauftragt': steps.find(s => s.name.toLowerCase().includes('beauftrag'))?.id,
      'versandt': steps.find(s => s.name.toLowerCase().includes('versand'))?.id,
      'gutgeschrieben': steps.find(s => s.name.toLowerCase().includes('gutschr'))?.id,
      'abgeschlossen': steps.find(s => s.name.toLowerCase().includes('abgeschl'))?.id
    };
    
    // Update returns for this action type
    for (const [status, stepId] of Object.entries(statusToStepMap)) {
      if (stepId) {
        db.prepare(`
          UPDATE supplier_returns
          SET workflow_id = ?, status_step_id = ?
          WHERE followUpAction = ? AND status = ?
        `).run(workflow.id, stepId, workflow.follow_up_action, status);
      }
    }
  }
}
```

### 2. Returns Database Module (`src/main/database/returns.ts`)

```typescript
// Update the updateReturnStatus function to work with steps
export function updateReturnStatus(returnId: string | string[], statusStepId: string): void {
  // Get the step information first
  const step = db.prepare(`
    SELECT s.*, w.id as workflow_id
    FROM status_steps s
    JOIN status_workflows w ON s.workflow_id = w.id
    WHERE s.id = ?
  `).get(statusStepId);
  
  if (!step) {
    throw new Error(`Status step with ID ${statusStepId} not found`);
  }
  
  // Use the step name as the status value for backward compatibility
  const stmt = db.prepare(`
    UPDATE supplier_returns
    SET status = ?,
        workflow_id = ?,
        status_step_id = ?,
        ${step.name === 'beauftragt' ? 'commissioningDate = CURRENT_TIMESTAMP,' : ''}
        ${step.name === 'versandt' ? 'shippingDate = CURRENT_TIMESTAMP,' : ''}
        ${step.name === 'abgeschlossen' ? 'reconciliationDate = CURRENT_TIMESTAMP,' : ''}
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  if (Array.isArray(returnId)) {
    db.transaction((ids: string[]) => {
      for (const id of ids) stmt.run(step.name, step.workflow_id, step.id, id);
    })(returnId);
  } else {
    stmt.run(step.name, step.workflow_id, step.id, returnId);
  }
}

// Add function to get valid next steps for a return
export function getValidNextSteps(returnId: string): any[] {
  const currentReturn = db.prepare(`
    SELECT workflow_id, status_step_id 
    FROM supplier_returns
    WHERE id = ?
  `).get(returnId);
  
  if (!currentReturn || !currentReturn.workflow_id) {
    // If no workflow is assigned, get all initial steps from default workflows
    return db.prepare(`
      SELECT s.*
      FROM status_steps s
      JOIN status_workflows w ON s.workflow_id = w.id
      WHERE w.is_default = 1 AND s.order_index = 0
    `).all();
  }
  
  // Get current step index
  const currentStep = db.prepare(`
    SELECT order_index
    FROM status_steps
    WHERE id = ?
  `).get(currentReturn.status_step_id);
  
  // Get next possible steps in the workflow
  return db.prepare(`
    SELECT *
    FROM status_steps
    WHERE workflow_id = ? AND order_index > ?
    ORDER BY order_index
  `).all(currentReturn.workflow_id, currentStep?.order_index || -1);
}
```

### 3. Types Definition (`src/shared/types.ts`)

```typescript
// Change ReturnStatus type from union to string
export type ReturnStatus = string;

// Add StatusTransition interface
export interface StatusTransition {
  fromStepId: string;
  toStepId: string;
  requiredFields: string[];
}

// Enhance ReturnItem interface
export interface ReturnItem {
  // ... existing fields
  workflowId?: string;
  statusStepId?: string;
}
```

### 4. Returns API (`src/main/api/returns.ts`)

```typescript
// Update the status update endpoint
router.patch('/:id/status', (req: Request, res: Response): void => {
  try {
    if (!req.body.stepId) {
      res.status(400).json({ error: 'stepId is required' });
      return;
    }
    
    const stepId = req.body.stepId;
    updateReturnStatus(req.params.id, stepId);
    
    // Return the updated return
    const updated = getAllReturns().find(r => r.id.toString() === req.params.id);
    
    if (!updated) {
      res.status(404).json({ error: 'Return not found' });
      return;
    }
    
    res.json({
      ...updated,
      id: String(updated.id),
      products: JSON.parse(updated.products || '[]'),
      notes: JSON.parse(updated.notes || '[]'),
      documents: JSON.parse(updated.documents || '[]'),
    });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: 'Internal server error updating return status' });
  }
});

// Add endpoint to get valid next steps
router.get('/:id/next-steps', (req: Request, res: Response): void => {
  try {
    const steps = getValidNextSteps(req.params.id);
    res.json(steps);
  } catch (error) {
    console.error('Error getting next steps:', error);
    res.status(500).json({ error: 'Internal server error getting next steps' });
  }
});
```

### 5. Frontend Hooks (`src/renderer/hooks/useReturns.ts`)

```typescript
// Update the status update hook
export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stepId }: { id: string; stepId: string }) => {
      console.log('useUpdateReturnStatus: Starting mutation', { id, stepId });
      try {
        const result = await ReturnsApi.updateStatus(id, stepId);
        console.log('useUpdateReturnStatus: Mutation successful', result);
        return result;
      } catch (error) {
        console.error('useUpdateReturnStatus: Mutation failed', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('useUpdateReturnStatus: Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
    onError: (error) => {
      console.error('useUpdateReturnStatus: Error in mutation', error);
    }
  });
};

// Add hook for getting valid next steps
export const useNextSteps = (returnId: string) => {
  return useQuery({
    queryKey: ['return', returnId, 'next-steps'],
    queryFn: () => ReturnsApi.getNextSteps(returnId),
    enabled: !!returnId,
  });
};
```

### 6. Returns API Client (`src/shared/api/returns-api.ts`)

```typescript
/**
 * Update return status
 * @param id Return ID
 * @param stepId Status step ID
 * @returns Promise with updated return
 */
static async updateStatus(id: string, stepId: string): Promise<ReturnItem> {
  return apiClient.patch<ReturnItem>(`/returns/${id}/status`, { stepId });
}

/**
 * Get valid next steps for a return
 * @param id Return ID
 * @returns Promise with available next steps
 */
static async getNextSteps(id: string): Promise<StatusStep[]> {
  return apiClient.get<StatusStep[]>(`/returns/${id}/next-steps`);
}
```

### 7. Frontend Components

Several UI components will need updating to use the dynamic status system:

#### Returns Table (`src/components/returns-table.tsx`)
- Update status column to show workflow step name
- Update status filtering to use workflow steps
- Modify status update actions

#### Batch Actions (`src/components/batch-actions.tsx`)
- Update to use workflow steps for status changes

#### Return Details Dialog
- Show workflow status steps instead of fixed statuses
- Use step colors for visual indicators

## Migration Strategy

1. Implement the database schema changes
2. Create a migration utility to map existing returns to appropriate workflows
3. Update the backend API to handle both old and new status methods (for backward compatibility)
4. Roll out frontend changes to use the new dynamic status system
5. Add comprehensive logging during migration to track any issues

## Testing Plan

1. Test database migration with sample data
2. Verify that existing returns maintain their status correctly
3. Test creating new returns with custom workflows
4. Validate status transitions follow the defined workflow rules
5. Check that required fields are enforced at each step
6. Test the UI correctly displays dynamic statuses and transitions

This implementation provides a fully dynamic status system while maintaining backward compatibility with existing return records.