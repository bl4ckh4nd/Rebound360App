import db from './db';

export async function initializeWorkflow(orderId: string): Promise<void> {
  const defaultWorkflowSteps = [
    { step_name: 'Draft', step_order: 1, status: 'completed' },
    { step_name: 'Review', step_order: 2, status: 'pending' },
    { step_name: 'Approval', step_order: 3, status: 'pending' },
    { step_name: 'Processing', step_order: 4, status: 'pending' },
    { step_name: 'Completed', step_order: 5, status: 'pending' }
  ];

  const stmt = db.prepare(`
    INSERT INTO procurement_workflow (
      procurement_id,
      step_name,
      step_order,
      status
    ) VALUES (?, ?, ?, ?)
  `);

  const insertWorkflowSteps = db.transaction(() => {
    for (const step of defaultWorkflowSteps) {
      stmt.run(orderId, step.step_name, step.step_order, step.status);
    }
  });

  try {
    insertWorkflowSteps();
    console.log(`Workflow initialized for procurement ID: ${orderId}`);
  } catch (error) {
    console.error('Error initializing workflow:', error);
    throw error;
  }
}

export function getWorkflowSteps(procurementId: number) {
  return db.prepare(`
    SELECT * FROM procurement_workflow 
    WHERE procurement_id = ? 
    ORDER BY step_order ASC
  `).all(procurementId);
}

export function updateWorkflowStep(
  procurementId: number, 
  stepName: string, 
  status: string
) {
  const stmt = db.prepare(`
    UPDATE procurement_workflow 
    SET status = ?, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE procurement_id = ? AND step_name = ?
  `);

  try {
    stmt.run(status, procurementId, stepName);
    console.log(`Updated workflow step '${stepName}' to '${status}'`);
  } catch (error) {
    console.error('Error updating workflow step:', error);
    throw error;
  }
} 