import db from './db';
import { v4 as uuidv4 } from 'uuid';
import { 
  Requisition, 
  RequisitionItem, 
  RequisitionComment, 
  PurchaseOrder,
  Address
} from '../../shared/types';
import { defaultProcurementWorkflow } from './procurement-init';
import type { StatusWorkflow } from '../../shared/types';

// Database initialization
export function initializeProcurementTables(): void {
  console.log('Creating procurement-related tables...');

  // Create requisitions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requisitions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      requester_id TEXT NOT NULL,
      requester_name TEXT NOT NULL,
      requester_email TEXT NOT NULL,
      department TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('low', 'normal', 'high')),
      status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'manager_approval', 'finance_approval', 'approved', 'rejected', 'cancelled', 'converted')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      needed_by TEXT,
      budget_code TEXT,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL,
      current_approver TEXT,
      procurement_type TEXT NOT NULL CHECK(procurement_type IN ('material', 'service', 'asset')),
      custom_fields TEXT, -- JSON object
      notes TEXT,
      approver_id TEXT,
      approver_name TEXT
    );
  `);

  // Create requisition_items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requisition_items (
      id TEXT PRIMARY KEY,
      requisition_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      unit TEXT NOT NULL,
      supplier_id TEXT,
      supplier_name TEXT,
      catalog_item_id TEXT,
      sku TEXT,
      notes TEXT,
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE
    );
  `);
  
  // Create requisition_comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requisition_comments (
      id TEXT PRIMARY KEY,
      requisition_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('comment', 'approval', 'rejection', 'system')),
      is_internal INTEGER DEFAULT 0, -- 0 for false, 1 for true
      FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE
    );
  `);

  // Create purchase_orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      requisition_id TEXT, -- Can be null if PO created directly
      order_number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      requester_id TEXT NOT NULL,
      requester_name TEXT NOT NULL,
      department TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('low', 'normal', 'high')),
      status TEXT NOT NULL CHECK(status IN ('draft', 'sent', 'acknowledged', 'partially_received', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      procurement_type TEXT NOT NULL CHECK(procurement_type IN ('material', 'service', 'asset')),
      custom_fields TEXT, -- JSON object
      supplier_reference TEXT,
      payment_terms TEXT,
      expected_delivery_date TEXT,
      billing_address TEXT NOT NULL, -- JSON object for Address
      shipping_address TEXT NOT NULL, -- JSON object for Address
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE SET NULL
    );
  `);
  
  // Note: Purchase order items are not explicitly defined as a separate table in the types or current functions.
  // They seem to re-use RequisitionItem type but aren't stored directly in the purchase_orders table.
  // A separate purchase_order_items table might be needed later.

  console.log('Procurement-related tables created or already exist.');

  // Now check if we need to initialize the workflow
  const migrationName = 'init_procurement_workflow';
  const migrationApplied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);
  
  if (!migrationApplied) {
    try {
      // Generate a workflow ID that will be used for both workflow and steps
      const workflowId = uuidv4();
      
      // Update the workflow ID in the default workflow steps
      const workflowWithId = {
        ...defaultProcurementWorkflow,
        steps: defaultProcurementWorkflow.steps.map(step => ({
          ...step,
          workflowId
        }))
      };

      db.transaction(() => {
        const now = new Date().toISOString();

        // Create workflow in database
        db.prepare(`
          INSERT INTO status_workflows (id, name, follow_up_action, is_default, workflow_type, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          workflowId,
          workflowWithId.name,
          workflowWithId.followUpAction,
          workflowWithId.isDefault ? 1 : 0,
          workflowWithId.workflowType,
          now,
          now
        );

        // Insert workflow steps
        const insertStep = db.prepare(`
          INSERT INTO status_steps (
            id, workflow_id, name, description, color, order_index, required_fields,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const step of workflowWithId.steps) {
          insertStep.run(
            step.id,
            workflowId,
            step.name,
            step.description,
            step.color,
            step.order,
            JSON.stringify(step.requiredFields),
            now,
            now
          );
        }

        // Record the migration
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
      })();

      console.log('Successfully initialized procurement workflow');
    } catch (error) {
      console.error('Error initializing procurement workflow:', error);
      throw error;
    }
  }
}

// Requisition functions
export async function getRequisitions(filters: Record<string, any> = {}): Promise<Requisition[]> {
  let query = `SELECT * FROM requisitions WHERE 1=1`;
  const params: any[] = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.department) {
    query += ' AND department = ?';
    params.push(filters.department);
  }

  if (filters.requesterId) {
    query += ' AND requester_id = ?';
    params.push(filters.requesterId);
  }

  const rows = db.prepare(query).all(...params) as any[];

  // Fetch related items and comments for each requisition
  return Promise.all(rows.map(async (row) => {
    const items = db.prepare('SELECT * FROM requisition_items WHERE requisition_id = ?')
      .all(row.id) as RequisitionItem[];

    const comments = db.prepare('SELECT * FROM requisition_comments WHERE requisition_id = ?')
      .all(row.id) as RequisitionComment[];

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      requesterId: row.requester_id,
      requesterName: row.requester_name,
      requesterEmail: row.requester_email,
      department: row.department,
      priority: row.priority,
      status: row.status,
      neededBy: row.needed_by,
      budgetCode: row.budget_code,
      totalAmount: row.total_amount,
      currency: row.currency,
      currentApprover: row.current_approver,
      procurementType: row.procurement_type,
      customFields: JSON.parse(row.custom_fields || '{}'),
      items,
      comments,
      notes: row.notes,
      attachmentIds: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }));
}

export async function getRequisitionById(id: string): Promise<Requisition | null> {
  const row = db.prepare('SELECT * FROM requisitions WHERE id = ?').get(id) as any;
  
  if (!row) return null;

  const items = db.prepare('SELECT * FROM requisition_items WHERE requisition_id = ?')
    .all(id) as RequisitionItem[];

  const comments = db.prepare('SELECT * FROM requisition_comments WHERE requisition_id = ?')
    .all(id) as RequisitionComment[];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    department: row.department,
    priority: row.priority,
    status: row.status,
    neededBy: row.needed_by,
    budgetCode: row.budget_code,
    totalAmount: row.total_amount,
    currency: row.currency,
    currentApprover: row.current_approver,
    procurementType: row.procurement_type,
    customFields: JSON.parse(row.custom_fields || '{}'),
    items,
    comments,
    notes: row.notes,
    attachmentIds: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createRequisition(requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requisition> {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO requisitions (
      id, title, description, requester_id, requester_name, requester_email,
      department, priority, status, needed_by, budget_code, total_amount,
      currency, current_approver, procurement_type, custom_fields, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    requisition.title,
    requisition.description,
    requisition.requesterId,
    requisition.requesterName,
    requisition.requesterEmail,
    requisition.department,
    requisition.priority,
    'draft',
    requisition.neededBy,
    requisition.budgetCode,
    requisition.totalAmount,
    requisition.currency,
    requisition.currentApprover,
    requisition.procurementType,
    JSON.stringify(requisition.customFields || {}),
    requisition.notes,
    now,
    now
  );

  // Insert items
  for (const item of requisition.items) {
    db.prepare(`
      INSERT INTO requisition_items (
        id, requisition_id, description, quantity, unit_price, unit,
        supplier_id, supplier_name, catalog_item_id, sku, notes,
        estimated_delivery, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id || uuidv4(),
      id,
      item.description,
      item.quantity,
      item.unitPrice,
      item.unit,
      item.supplierId,
      item.supplierName,
      item.catalogItemId,
      item.sku,
      item.notes,
      item.estimatedDelivery,
      now,
      now
    );
  }

  // Insert comments
  for (const comment of requisition.comments) {
    db.prepare(`
      INSERT INTO requisition_comments (
        id, requisition_id, user_id, user_name, text, is_internal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      comment.id || uuidv4(),
      id,
      comment.userId,
      comment.userName,
      comment.text,
      comment.isInternal ? 1 : 0,
      comment.createdAt || now
    );
  }

  return getRequisitionById(id) as Promise<Requisition>;
}

export async function updateRequisition(requisition: Requisition): Promise<Requisition> {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE requisitions SET
      title = ?,
      description = ?,
      requester_id = ?,
      requester_name = ?,
      requester_email = ?,
      department = ?,
      priority = ?,
      status = ?,
      needed_by = ?,
      budget_code = ?,
      total_amount = ?,
      currency = ?,
      current_approver = ?,
      procurement_type = ?,
      custom_fields = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    requisition.title,
    requisition.description,
    requisition.requesterId,
    requisition.requesterName,
    requisition.requesterEmail,
    requisition.department,
    requisition.priority,
    requisition.status,
    requisition.neededBy,
    requisition.budgetCode,
    requisition.totalAmount,
    requisition.currency,
    requisition.currentApprover,
    requisition.procurementType,
    JSON.stringify(requisition.customFields || {}),
    requisition.notes,
    now,
    requisition.id
  );

  // Update items: delete existing and insert new
  db.prepare('DELETE FROM requisition_items WHERE requisition_id = ?').run(requisition.id);
  for (const item of requisition.items) {
    db.prepare(`
      INSERT INTO requisition_items (
        id, requisition_id, description, quantity, unit_price, unit,
        supplier_id, supplier_name, catalog_item_id, sku, notes,
        estimated_delivery, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id || uuidv4(),
      requisition.id,
      item.description,
      item.quantity,
      item.unitPrice,
      item.unit,
      item.supplierId,
      item.supplierName,
      item.catalogItemId,
      item.sku,
      item.notes,
      item.estimatedDelivery,
      now,
      now
    );
  }

  // Update comments: add new ones only
  for (const comment of requisition.comments) {
    if (!comment.id) {
      db.prepare(`
        INSERT INTO requisition_comments (
          id, requisition_id, user_id, user_name, text, is_internal, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        requisition.id,
        comment.userId,
        comment.userName,
        comment.text,
        comment.isInternal ? 1 : 0,
        comment.createdAt || now
      );
    }
  }

  return getRequisitionById(requisition.id) as Promise<Requisition>;
}

export async function deleteRequisition(id: string): Promise<void> {
  // Comments and items will be deleted automatically due to ON DELETE CASCADE
  db.prepare('DELETE FROM requisitions WHERE id = ?').run(id);
}

// Purchase Order functions
export async function getPurchaseOrders(filters: Record<string, any> = {}): Promise<PurchaseOrder[]> {
  let query = 'SELECT * FROM purchase_orders WHERE 1=1';
  const params: any[] = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.department) {
    query += ' AND department = ?';
    params.push(filters.department);
  }

  if (filters.requesterId) {
    query += ' AND requester_id = ?';
    params.push(filters.requesterId);
  }

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    requisitionId: row.requisition_id,
    orderNumber: row.order_number,
    title: row.title,
    description: row.description,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    department: row.department,
    priority: row.priority,
    status: row.status,
    supplierReference: row.supplier_reference,
    paymentTerms: row.payment_terms,
    expectedDeliveryDate: row.expected_delivery_date,
    totalAmount: row.total_amount,
    currency: row.currency,
    procurementType: row.procurement_type,
    customFields: JSON.parse(row.custom_fields || '{}'),
    billingAddress: JSON.parse(row.billing_address),
    shippingAddress: JSON.parse(row.shipping_address),
    items: JSON.parse(row.items || '[]'),
    attachmentIds: [], // TODO: Implement attachments
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  const row = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id) as any;
  
  if (!row) return null;

  return {
    id: row.id,
    requisitionId: row.requisition_id,
    orderNumber: row.order_number,
    title: row.title,
    description: row.description,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    department: row.department,
    priority: row.priority,
    status: row.status,
    supplierReference: row.supplier_reference,
    paymentTerms: row.payment_terms,
    expectedDeliveryDate: row.expected_delivery_date,
    totalAmount: row.total_amount,
    currency: row.currency,
    procurementType: row.procurement_type,
    customFields: JSON.parse(row.custom_fields || '{}'),
    billingAddress: JSON.parse(row.billing_address),
    shippingAddress: JSON.parse(row.shipping_address),
    items: JSON.parse(row.items || '[]'),
    attachmentIds: [], // TODO: Implement attachments
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
  const id = uuidv4();
  const now = new Date().toISOString();
  console.log('[STUB] Creating Purchase Order:', purchaseOrder);

  db.prepare(`
    INSERT INTO purchase_orders (
      id, requisition_id, order_number, title, description, requester_id,
      requester_name, department, priority, status, supplier_reference,
      payment_terms, expected_delivery_date, total_amount, currency,
      procurement_type, custom_fields, billing_address, shipping_address,
      items,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    purchaseOrder.requisitionId,
    purchaseOrder.orderNumber,
    purchaseOrder.title,
    purchaseOrder.description,
    purchaseOrder.requesterId,
    purchaseOrder.requesterName,
    purchaseOrder.department,
    purchaseOrder.priority,
    purchaseOrder.status,
    purchaseOrder.supplierReference,
    purchaseOrder.paymentTerms,
    purchaseOrder.expectedDeliveryDate,
    purchaseOrder.totalAmount,
    purchaseOrder.currency,
    purchaseOrder.procurementType,
    JSON.stringify(purchaseOrder.customFields || {}),
    JSON.stringify(purchaseOrder.billingAddress),
    JSON.stringify(purchaseOrder.shippingAddress),
    JSON.stringify(purchaseOrder.items || []),
    now,
    now
  );

  return getPurchaseOrderById(id) as Promise<PurchaseOrder>;
}

export async function updatePurchaseOrder(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
  const now = new Date().toISOString();
  console.log('[STUB] Updating Purchase Order:', purchaseOrder);

  db.prepare(`
    UPDATE purchase_orders SET
      requisition_id = ?,
      order_number = ?,
      title = ?,
      description = ?,
      requester_id = ?,
      requester_name = ?,
      department = ?,
      priority = ?,
      status = ?,
      supplier_reference = ?,
      payment_terms = ?,
      expected_delivery_date = ?,
      total_amount = ?,
      currency = ?,
      procurement_type = ?,
      custom_fields = ?,
      billing_address = ?,
      shipping_address = ?,
      items = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    purchaseOrder.requisitionId,
    purchaseOrder.orderNumber,
    purchaseOrder.title,
    purchaseOrder.description,
    purchaseOrder.requesterId,
    purchaseOrder.requesterName,
    purchaseOrder.department,
    purchaseOrder.priority,
    purchaseOrder.status,
    purchaseOrder.supplierReference,
    purchaseOrder.paymentTerms,
    purchaseOrder.expectedDeliveryDate,
    purchaseOrder.totalAmount,
    purchaseOrder.currency,
    purchaseOrder.procurementType,
    JSON.stringify(purchaseOrder.customFields || {}),
    JSON.stringify(purchaseOrder.billingAddress),
    JSON.stringify(purchaseOrder.shippingAddress),
    JSON.stringify(purchaseOrder.items || []),
    now,
    purchaseOrder.id
  );

  return getPurchaseOrderById(purchaseOrder.id) as Promise<PurchaseOrder>;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(id);
}

// --- STUBBED WORKFLOW ACTION FUNCTIONS ---

async function addRequisitionComment(
  requisitionId: string,
  text: string,
  type: 'comment' | 'approval' | 'rejection' | 'system',
  userId: string = 'system',
  userName: string = 'System'
): Promise<void> {
  // This is a helper function, real implementation needed
  console.log(`[STUB] Adding comment to ${requisitionId}: ${text} (Type: ${type}, User: ${userName})`);
  /*
  db.prepare(`
    INSERT INTO requisition_comments (id, requisition_id, user_id, user_name, text, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), requisitionId, userId, userName, text, type, new Date().toISOString());
  */
}

export async function submitRequisition(requisitionId: string): Promise<Requisition> {
  console.log(`[STUB] Submitting requisition ${requisitionId}`);
  // TODO: Implement actual database update
  /*
  const now = new Date().toISOString();
  db.prepare(`UPDATE requisitions SET status = 'submitted', updated_at = ? WHERE id = ?`).run(now, requisitionId);
  await addRequisitionComment(requisitionId, 'Requisition submitted for approval.', 'system');
  */
  return getRequisitionById(requisitionId) as Promise<Requisition>; // Return updated data
}

export async function approveRequisition({
  requisitionId,
  comment,
  approverId,
  approverName
}: {
  requisitionId: string;
  comment?: string;
  approverId?: string; // Assuming passed from frontend context/auth
  approverName?: string; // Assuming passed from frontend context/auth
}): Promise<Requisition> {
  const approver = approverName || 'System Approver'; // Placeholder
  console.log(`[STUB] Approving requisition ${requisitionId} by ${approver}. Comment: ${comment}`);
  // TODO: Implement actual database update and potentially multi-stage logic
  /*
  const now = new Date().toISOString();
  // Simple approval for now, update as needed for multi-stage
  db.prepare(`UPDATE requisitions SET status = 'approved', updated_at = ?, approver_id = ?, approver_name = ? WHERE id = ?`)
    .run(now, approverId, approverName, requisitionId);
  await addRequisitionComment(requisitionId, comment || 'Approved.', 'approval', approverId, approverName);
  */
  return getRequisitionById(requisitionId) as Promise<Requisition>;
}

export async function rejectRequisition({
  requisitionId,
  comment,
  rejectorId,
  rejectorName
}: {
  requisitionId: string;
  comment: string; // Rejection comment is mandatory
  rejectorId?: string;
  rejectorName?: string;
}): Promise<Requisition> {
  const rejector = rejectorName || 'System Rejector'; // Placeholder
  console.log(`[STUB] Rejecting requisition ${requisitionId} by ${rejector}. Reason: ${comment}`);
  // TODO: Implement actual database update
  /*
  if (!comment?.trim()) {
      throw new Error('Rejection comment is required.');
  }
  const now = new Date().toISOString();
  db.prepare(`UPDATE requisitions SET status = 'rejected', updated_at = ? WHERE id = ?`).run(now, requisitionId);
  await addRequisitionComment(requisitionId, comment, 'rejection', rejectorId, rejectorName);
  */
  return getRequisitionById(requisitionId) as Promise<Requisition>;
}

export async function convertToPurchaseOrder(
  requisitionId: string,
  poDetails: { billingAddress: Address; shippingAddress: Address }
): Promise<PurchaseOrder> {
  console.log(`[STUB] Converting requisition ${requisitionId} to Purchase Order.`);
  console.log('[STUB] PO Details:', poDetails);
  // TODO: Implement actual conversion logic
  /*
  const requisition = await getRequisitionById(requisitionId);
  if (!requisition || requisition.status !== 'approved') {
    throw new Error('Requisition not found or not in approved state for conversion.');
  }

  // Generate PO number (replace with actual logic)
  const orderNumber = `PO-${Date.now()}`;
  const now = new Date().toISOString();

  const newPO: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> = {
    requisitionId: requisition.id,
    orderNumber: orderNumber,
    title: `PO for Requisition: ${requisition.title}`,
    description: requisition.description,
    requesterId: requisition.requesterId,
    requesterName: requisition.requesterName,
    department: requisition.department,
    priority: requisition.priority,
    status: 'draft', // Or 'sent' depending on process
    procurementType: requisition.procurementType,
    billingAddress: poDetails.billingAddress,
    shippingAddress: poDetails.shippingAddress,
    totalAmount: requisition.totalAmount,
    currency: requisition.currency,
    items: requisition.items, // Pass items array
    customFields: requisition.customFields,
    // Add other fields like payment_terms, expected_delivery_date if needed
    supplierReference: undefined,
    paymentTerms: undefined,
    expectedDeliveryDate: undefined,
    attachmentIds: []
  };

  const createdPO = await createPurchaseOrder(newPO);

  // Update requisition status
  db.prepare(`UPDATE requisitions SET status = 'converted', updated_at = ? WHERE id = ?`).run(now, requisitionId);
  await addRequisitionComment(requisitionId, `Converted to Purchase Order ${orderNumber}`, 'system');

  return createdPO;
  */

  // Return dummy data for stub
  const dummyPO: PurchaseOrder = {
    id: uuidv4(),
    requisitionId: requisitionId,
    orderNumber: `PO-STUB-${Date.now()}`,
    title: `PO Stub for Req ${requisitionId}`,
    description: 'Stubbed PO',
    requesterId: 'stub-user',
    requesterName: 'Stub User',
    department: 'Stub Dept',
    priority: 'normal',
    status: 'draft',
    procurementType: 'material',
    totalAmount: 100,
    currency: 'EUR',
    billingAddress: poDetails.billingAddress,
    shippingAddress: poDetails.shippingAddress,
    items: [], // Placeholder
    customFields: {},
    attachmentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return Promise.resolve(dummyPO);
}


// --- END STUBBED WORKFLOW FUNCTIONS ---

export * from './procurement-init';