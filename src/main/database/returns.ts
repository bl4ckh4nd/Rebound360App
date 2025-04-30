import db, { getUploadsDir } from './db';
import fs from 'fs';
import { ReturnItem, ReturnStatus, ReturnProduct, Document, Note, CreateReturnFromOrderData, OrderProduct } from '../../shared/types';
import { getOrderById as getOriginalOrderById } from './orders';

interface DatabaseReturnRow {
  id: number;
  orderNumber: string | null;
  status: ReturnStatus;
  followUpAction: ReturnItem['followUpAction'];
  workflow_id: string | null;
  supplierReference: string | null;
  commissioningDate: string | null;
  shippingDate: string | null;
  creditNoteNumber: string | null;
  creditAmount: number | null;
  originalInvoiceNumber: string | null;
  creditDate: string | null;
  creditNoteStatus: string | null;
  reconciliationDate: string | null;
  reconciliationInvoiceNumber: string | null;
  orderId: number | null;
  creditorNumber: string | null;
  customFields: string;
  createdAt: string;
  updatedAt: string | null;
  products: string;
  notes: string;
  documents: string;
}

// Get all returns with their products, notes and documents
export function getAllReturns(): DatabaseReturnRow[] {
  return db.prepare(`
    SELECT r.*,
           json_group_array(
             CASE 
               WHEN p.id IS NOT NULL THEN json_object('id', p.id, 'productName', p.productName, 'quantity', p.quantity, 'reason', p.reason, 'serialNumber', p.serialNumber)
               ELSE NULL
             END
           ) FILTER (WHERE p.id IS NOT NULL) as products,
           json_group_array(
             CASE 
               WHEN n.id IS NOT NULL THEN json_object('id', n.id, 'returnId', n.returnId, 'content', n.content, 'author', n.author, 'createdAt', n.createdAt)
               ELSE NULL
             END
           ) FILTER (WHERE n.id IS NOT NULL) as notes,
           json_group_array(
             CASE 
               WHEN d.id IS NOT NULL THEN json_object('id', d.id, 'returnId', d.returnId, 'fileName', d.fileName, 'fileType', d.fileType, 'fileSize', d.fileSize, 'filePath', d.filePath, 'description', d.description, 'thumbnailPath', d.thumbnailPath, 'uploadDate', d.uploadDate)
               ELSE NULL
             END
           ) FILTER (WHERE d.id IS NOT NULL) as documents
    FROM supplier_returns r
    LEFT JOIN return_products p ON r.id = p.returnId
    LEFT JOIN return_notes n ON r.id = n.returnId
    LEFT JOIN return_documents d ON r.id = d.returnId
    GROUP BY r.id
    ORDER BY r.createdAt DESC
  `).all() as DatabaseReturnRow[];
}

// Get returns filtered by order ID
export function getReturnsByOrderId(orderId: number): DatabaseReturnRow[] {
  return db.prepare(`
    SELECT r.*,
           json_group_array(
             CASE 
               WHEN p.id IS NOT NULL THEN json_object('id', p.id, 'productName', p.productName, 'quantity', p.quantity, 'reason', p.reason, 'serialNumber', p.serialNumber)
               ELSE NULL
             END
           ) FILTER (WHERE p.id IS NOT NULL) as products,
           json_group_array(
             CASE 
               WHEN n.id IS NOT NULL THEN json_object('id', n.id, 'returnId', n.returnId, 'content', n.content, 'author', n.author, 'createdAt', n.createdAt)
               ELSE NULL
             END
           ) FILTER (WHERE n.id IS NOT NULL) as notes,
           json_group_array(
             CASE 
               WHEN d.id IS NOT NULL THEN json_object('id', d.id, 'returnId', d.returnId, 'fileName', d.fileName, 'fileType', d.fileType, 'fileSize', d.fileSize, 'filePath', d.filePath, 'description', d.description, 'thumbnailPath', d.thumbnailPath, 'uploadDate', d.uploadDate)
               ELSE NULL
             END
           ) FILTER (WHERE d.id IS NOT NULL) as documents
    FROM supplier_returns r
    LEFT JOIN return_products p ON r.id = p.returnId
    LEFT JOIN return_notes n ON r.id = n.returnId
    LEFT JOIN return_documents d ON r.id = d.returnId
    WHERE r.orderId = ? -- Filter by orderId
    GROUP BY r.id
    ORDER BY r.createdAt DESC
  `).all(orderId) as DatabaseReturnRow[];
}

// Create a new return
export function createReturn(returnData: Partial<ReturnItem>): number {
  const transaction = db.transaction((data) => {
    const returnResult = db.prepare(`
      INSERT INTO supplier_returns (orderNumber, status, followUpAction, supplierReference, workflow_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      data.orderNumber ?? null,
      data.status ?? 'ausstehend',
      data.followUpAction ?? 'gutschrift',
      data.supplierReference ?? null,
      data.workflow_id ?? null
    );
    
    const newReturnId = Number(returnResult.lastInsertRowid);
    
    if (data.products?.length) {
      const productStmt = db.prepare(`
        INSERT INTO return_products (returnId, productName, quantity, reason, serialNumber)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const product of data.products) {
        productStmt.run(
          newReturnId,
          product.productName,
          Number(product.quantity),
          product.reason,
          product.serialNumber ?? null
        );
      }
    }
    
    return newReturnId;
  });
  
  return transaction(returnData);
}

// Create a draft return for document uploads
export function createDraftReturn(): number {
  const result = db.prepare(`
    INSERT INTO supplier_returns (status, followUpAction)
    VALUES ('ausstehend', 'gutschrift')
  `).run();
  
  return Number(result.lastInsertRowid);
}

// Update return status
export function updateReturnStatus(returnId: string | string[], status: ReturnStatus): void {
  const stmt = db.prepare(`
    UPDATE supplier_returns
    SET status = ?,
        ${status === 'beauftragt' ? 'commissioningDate = CURRENT_TIMESTAMP,' : ''}
        ${status === 'versandt' ? 'shippingDate = CURRENT_TIMESTAMP,' : ''}
        ${status === 'abgeschlossen' ? 'reconciliationDate = CURRENT_TIMESTAMP,' : ''}
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  if (Array.isArray(returnId)) {
    db.transaction((ids: string[]) => {
      for (const id of ids) stmt.run(status, id);
    })(returnId);
  } else {
    stmt.run(status, returnId);
  }
}

// Add a note to a return
export function addReturnNote(returnId: string, content: string, author: string) {
  return db.prepare(`
    INSERT INTO return_notes (returnId, content, author)
    VALUES (?, ?, ?)
  `).run(returnId, content, author);
}

// Update return fields
export function updateReturn(id: string, data: Partial<ReturnItem>) {
  const { customFields, ...otherFields } = data;
  
  const updates: Record<string, any> = { ...otherFields };
  if (customFields) {
    updates.customFields = JSON.stringify(customFields);
  }
  
  const fields = Object.keys(updates)
    .map(key => `${key} = @${key}`)
    .join(', ');
    
  return db.prepare(`
    UPDATE supplier_returns 
    SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = @id
  `).run({ id, ...updates });
}

// Update a draft return with products and other data
export function updateReturnWithProducts(returnId: string, returnData: Partial<ReturnItem>): void {
  const transaction = db.transaction((data) => {
    // First update the main return data
    db.prepare(`
      UPDATE supplier_returns
      SET orderNumber = ?,
          supplierReference = ?,
          followUpAction = ?,
          status = ?,
          workflow_id = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.orderNumber ?? null,
      data.supplierReference ?? null,
      data.followUpAction ?? 'gutschrift',
      data.status ?? 'ausstehend',
      data.workflow_id ?? null,
      data.id
    );
    
    // Delete existing products for this return
    db.prepare('DELETE FROM return_products WHERE returnId = ?').run(data.id);
    
    // Insert new products
    if (data.products?.length) {
      const productStmt = db.prepare(`
        INSERT INTO return_products (returnId, productName, quantity, reason, serialNumber)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const product of data.products) {
        productStmt.run(
          data.id,
          product.productName,
          Number(product.quantity),
          product.reason,
          product.serialNumber ?? null
        );
      }
    }
  });
  
  transaction({ ...returnData, id: returnId });
}

// Delete a draft return and its associated documents
export function deleteDraftReturn(returnId: string) {
  const transaction = db.transaction(() => {
    // First delete any documents associated with this return
    const documents = getDocumentsByReturnId(returnId);
    
    for (const document of documents) {
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      if (document.thumbnailPath && fs.existsSync(document.thumbnailPath)) {
        fs.unlinkSync(document.thumbnailPath);
      }
    }
    
    // Delete documents from database
    db.prepare('DELETE FROM return_documents WHERE returnId = ?').run(returnId);
    
    // Delete notes if any
    db.prepare('DELETE FROM return_notes WHERE returnId = ?').run(returnId);
    
    // Delete return
    return db.prepare('DELETE FROM supplier_returns WHERE id = ?').run(returnId);
  });
  
  return transaction();
}

// Update return fields and status in a single transaction
export function updateReturnWithStatus(id: string, data: Partial<ReturnItem>): void {
  const transaction = db.transaction((updateData) => {
    const { status, customFields, ...otherFields } = updateData;
    
    // Build the update fields
    const updates: Record<string, any> = { ...otherFields };
    if (customFields) {
      updates.customFields = JSON.stringify(customFields);
    }

    // Build the dynamic SQL for field updates
    let sql = 'UPDATE supplier_returns SET ';
    const fields = Object.keys(updates).map(key => `${key} = @${key}`);
    
    // Add status and status-specific timestamp updates if status is being changed
    if (status) {
      updates.status = status; // Add status to updates object
      fields.push('status = @status');
      
      switch(status) {
        case 'beauftragt':
          fields.push('commissioningDate = datetime(\'now\')');
          break;
        case 'versandt':
          fields.push('shippingDate = datetime(\'now\')');
          break;
        case 'abgeschlossen':
          fields.push('reconciliationDate = datetime(\'now\')');
          break;
      }
    }
    
    fields.push('updatedAt = datetime(\'now\')');
    sql += fields.join(', ');
    sql += ' WHERE id = @id';

    console.log('Executing SQL:', sql);
    console.log('With params:', { id, ...updates });

    // Execute the update
    const result = db.prepare(sql).run({
      id,
      ...updates
    });

    console.log('Update result:', result);
    return result;
  });

  transaction(data);
}

// Get documents by return ID (imported from documents.ts)
import { getDocumentsByReturnId } from './documents';

// Create a return based on data from an existing order
export function createReturnFromOrder(data: CreateReturnFromOrderData): ReturnItem {
  const transaction = db.transaction(() => {
    // 1. Get the original order details and validate it exists
    const originalOrder = getOriginalOrderById(data.orderId);
    if (!originalOrder) {
      throw new Error(`Original order with jtl_id ${data.orderId} not found.`);
    }

    // 2. Get the internal database ID for the order using jtl_id
    const orderRecord = db.prepare('SELECT id FROM supplier_orders WHERE jtl_id = ?').get(data.orderId) as { id: number } | undefined;
    if (!orderRecord) {
      throw new Error(`Order with jtl_id ${data.orderId} not found in supplier_orders table.`);
    }
    const internalOrderId = orderRecord.id;

    // 3. Normalize and validate status
    const normalizedStatus = (data.status ?? 'ausstehend').toLowerCase();
    const validStatuses = ['ausstehend', 'beauftragt', 'versandt', 'gutgeschrieben', 'abgeschlossen'];
    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${normalizedStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // 4. Validate workflow_id if provided
    let validWorkflowId: string | null = null;
    if (data.workflow_id) {
      const workflowExists = db.prepare('SELECT id FROM status_workflows WHERE id = ?').get(data.workflow_id);
      if (!workflowExists) {
        console.warn(`Workflow ID ${data.workflow_id} not found in status_workflows table. Proceeding without workflow.`);
      } else {
        validWorkflowId = data.workflow_id;
      }
    }

    // 5. Normalize and validate followUpAction
    const normalizedFollowUpAction = data.followUpAction.toLowerCase();
    const validFollowUpActions = ['gutschrift', 'ersatz', 'reparatur', 'ausschuss'];
    if (!validFollowUpActions.includes(normalizedFollowUpAction)) {
      throw new Error(`Invalid followUpAction: ${normalizedFollowUpAction}. Must be one of: ${validFollowUpActions.join(', ')}`);
    }

    // 6. Insert the main return record
    const returnInsertStmt = db.prepare(`
      INSERT INTO supplier_returns (
        orderId, 
        orderNumber, 
        supplierReference, 
        status, 
        followUpAction, 
        workflow_id,
        createdAt, 
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    // Log insert params
    const insertParams = {
      orderId: internalOrderId, // Use the internal ID here
      orderNumber: originalOrder.orderNumber,
      supplierReference: originalOrder.supplierReference ?? null,
      status: normalizedStatus,
      followUpAction: normalizedFollowUpAction,
      workflow_id: validWorkflowId
    };
    console.log('[createReturnFromOrder] Running INSERT INTO supplier_returns with params:', insertParams);

    const result = returnInsertStmt.run(
      insertParams.orderId,
      insertParams.orderNumber,
      insertParams.supplierReference,
      insertParams.status,
      insertParams.followUpAction,
      insertParams.workflow_id
    );

    const newReturnId = Number(result.lastInsertRowid);

    // 7. Insert return products
    if (data.products?.length) {
      const productInsertStmt = db.prepare(`
        INSERT INTO return_products (returnId, productName, quantity, reason, serialNumber)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Get original product details - using jtl_id for product lookup
      const getOriginalProductStmt = db.prepare('SELECT productName, serialNumber FROM order_products WHERE orderId = ? AND jtl_id = ?');
      
      for (const returnProductData of data.products) {
        const originalProduct = getOriginalProductStmt.get(internalOrderId, returnProductData.jtl_id) as (OrderProduct | undefined);
        
        if (!originalProduct) {
          console.warn(`Original order product with jtl_id ${returnProductData.jtl_id} not found for order ${data.orderId}.`);
          continue;
        }

        productInsertStmt.run(
          newReturnId,
          originalProduct.productName,
          Number(returnProductData.quantity),
          returnProductData.reason,
          originalProduct.serialNumber ?? null
        );
      }
    }

    return newReturnId;
  });

  const newReturnId = transaction();
  
  // 8. Fetch and return the newly created complete return item
  const newReturn = getReturnById(String(newReturnId));
  if (!newReturn) {
    throw new Error(`Failed to retrieve newly created return with ID ${newReturnId}.`);
  }
  return newReturn;
}

// Get a single return by ID, including its products, notes, and documents
export function getReturnById(id: string): ReturnItem | null {
  const row = db.prepare(`
    SELECT r.*,
           json_group_array(
             CASE 
               WHEN p.id IS NOT NULL THEN json_object('id', p.id, 'productName', p.productName, 'quantity', p.quantity, 'reason', p.reason, 'serialNumber', p.serialNumber)
               ELSE NULL
             END
           ) FILTER (WHERE p.id IS NOT NULL) as products,
           json_group_array(
             CASE 
               WHEN n.id IS NOT NULL THEN json_object('id', n.id, 'returnId', n.returnId, 'content', n.content, 'author', n.author, 'createdAt', n.createdAt)
               ELSE NULL
             END
           ) FILTER (WHERE n.id IS NOT NULL) as notes,
           json_group_array(
             CASE 
               WHEN d.id IS NOT NULL THEN json_object('id', d.id, 'returnId', d.returnId, 'fileName', d.fileName, 'fileType', d.fileType, 'fileSize', d.fileSize, 'filePath', d.filePath, 'description', d.description, 'thumbnailPath', d.thumbnailPath, 'uploadDate', d.uploadDate)
               ELSE NULL
             END
           ) FILTER (WHERE d.id IS NOT NULL) as documents
    FROM supplier_returns r
    LEFT JOIN return_products p ON r.id = p.returnId
    LEFT JOIN return_notes n ON r.id = n.returnId
    LEFT JOIN return_documents d ON r.id = d.returnId
    WHERE r.id = ?
    GROUP BY r.id
  `).get(id) as DatabaseReturnRow | undefined;

  if (!row) return null;

  // Helper function to safely parse JSON, returning an empty array on error or null input
  const safeJsonParse = <T>(jsonString: string | null | undefined): T[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      // Handle case where json_group_array returns [null] for no matches
      return Array.isArray(parsed) ? parsed.filter(item => item !== null) : [];
    } catch (e) {
      console.error('Error parsing JSON from DB:', e, 'String:', jsonString); 
      return [];
    }
  };
  
  return {
    id: String(row.id), // Ensure ID is string
    orderNumber: row.orderNumber ?? undefined,
    status: row.status,
    followUpAction: row.followUpAction,
    workflow_id: row.workflow_id ?? undefined,
    supplierReference: row.supplierReference ?? undefined,
    commissioningDate: row.commissioningDate ?? undefined,
    shippingDate: row.shippingDate ?? undefined,
    creditNoteNumber: row.creditNoteNumber ?? undefined,
    creditAmount: row.creditAmount ?? undefined,
    originalInvoiceNumber: row.originalInvoiceNumber ?? undefined,
    creditDate: row.creditDate ?? undefined,
    creditNoteStatus: (row.creditNoteStatus as ReturnItem['creditNoteStatus']) ?? undefined,
    reconciliationDate: row.reconciliationDate ?? undefined,
    reconciliationInvoiceNumber: row.reconciliationInvoiceNumber ?? undefined,
    orderId: row.orderId ?? undefined,
    creditorNumber: row.creditorNumber ?? undefined,
    customFields: row.customFields ? JSON.parse(row.customFields) : {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    products: safeJsonParse<ReturnProduct>(row.products),
    notes: safeJsonParse<Note>(row.notes),
    documents: safeJsonParse<Document>(row.documents)
  };
}

// Delete a specific return and its associated data (products, notes, documents, files)
export function deleteReturnById(returnId: string) {
  const transaction = db.transaction(() => {
    // Get associated documents to delete files
    const documents = getDocumentsByReturnId(returnId);
    for (const document of documents) {
      if (document.filePath && fs.existsSync(document.filePath)) {
        try {
          fs.unlinkSync(document.filePath);
        } catch (err) {
          console.error(`Failed to delete file ${document.filePath}:`, err);
          // Optionally throw or log more prominently
        }
      }
      if (document.thumbnailPath && fs.existsSync(document.thumbnailPath)) {
        try {
          fs.unlinkSync(document.thumbnailPath);
        } catch (err) {
          console.error(`Failed to delete thumbnail ${document.thumbnailPath}:`, err);
          // Optionally throw or log more prominently
        }
      }
    }

    // Delete associated data first (due to foreign key constraints if they exist)
    db.prepare('DELETE FROM return_products WHERE returnId = ?').run(returnId);
    db.prepare('DELETE FROM return_notes WHERE returnId = ?').run(returnId);
    db.prepare('DELETE FROM return_documents WHERE returnId = ?').run(returnId);

    // Finally, delete the return itself
    const result = db.prepare('DELETE FROM supplier_returns WHERE id = ?').run(returnId);

    return result;
  });

  return transaction();
}
