import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as procurementDb from '../database/procurement';
import { getRequisitionRepository, getPurchaseOrderRepository } from '../database/repositories';
import { 
  Requisition, 
  PurchaseOrder, 
  RequisitionStatus, 
  RequisitionItem, 
  RequisitionComment,
  Address
} from '../../shared/types';
import { useTypeORMForProcurement, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';
import { EmailService } from '../services/email-service';

// TypeORM entity types (different from shared types)
import { Requisition as RequisitionEntity } from '../database/entities/procurement/Requisition';
import { PurchaseOrder as PurchaseOrderEntity } from '../database/entities/procurement/PurchaseOrder';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

const emailService = new EmailService();

interface IdParams extends ParamsDictionary { id: string }

interface RequisitionFilters {
  status?: string;
  department?: string;
  requesterId?: string;
  procurementType?: string;
}

interface PurchaseOrderFilters {
  status?: string;
  department?: string;
  requesterId?: string;
}

interface ConvertToPOBody {
  billingAddress: Address;
  shippingAddress: Address;
}

interface ApprovalBody {
  comment?: string;
  approverId: string;
  approverName: string;
}

interface RejectionBody {
  comment: string;
  rejectorId: string;
  rejectorName: string;
}

/**
 * Hybrid procurement API that can use TypeORM or fallback to better-sqlite3
 * Handles requisitions, purchase orders, and complex approval workflows
 */
const router = Router();

// Helper function to transform TypeORM entity to shared type
function transformRequisitionEntity(entity: RequisitionEntity): Requisition {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    requesterId: entity.requesterId,
    requesterName: entity.requesterName,
    requesterEmail: entity.requesterEmail,
    department: entity.department,
    status: entity.status as RequisitionStatus,
    priority: entity.priority,
    procurementType: entity.procurementType,
    totalAmount: entity.totalAmount,
    items: entity.items?.map(item => ({
      id: item.id,
      requisitionId: item.requisitionId,
      productName: item.productName,
      productDescription: item.productDescription,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      preferredSupplier: item.preferredSupplier,
      urgency: item.urgency,
      specifications: item.specifications,
      createdAt: item.createdAt?.toISOString(),
      updatedAt: item.updatedAt?.toISOString()
    })) || [],
    comments: entity.comments?.map(comment => ({
      id: comment.id,
      requisitionId: comment.requisitionId,
      content: comment.content,
      author: comment.author,
      commentType: comment.commentType,
      createdAt: comment.createdAt?.toISOString()
    })) || [],
    customFields: entity.customFields,
    workflowId: entity.workflowId,
    currentStepId: entity.currentStepId,
    submittedAt: entity.submittedAt?.toISOString(),
    completedAt: entity.completedAt?.toISOString(),
    createdAt: entity.createdAt?.toISOString(),
    updatedAt: entity.updatedAt?.toISOString()
  };
}

function transformPurchaseOrderEntity(entity: PurchaseOrderEntity): PurchaseOrder {
  return {
    id: entity.id,
    poNumber: entity.poNumber,
    requisitionId: entity.requisitionId,
    title: entity.title,
    description: entity.description,
    requesterId: entity.requesterId,
    requesterName: entity.requesterName,
    department: entity.department,
    status: entity.status,
    priority: entity.priority,
    totalAmount: entity.totalAmount,
    billingAddress: entity.billingAddress,
    shippingAddress: entity.shippingAddress,
    supplierId: entity.supplierId,
    supplierName: entity.supplierName,
    expectedDeliveryDate: entity.expectedDeliveryDate?.toISOString(),
    orderDate: entity.orderDate?.toISOString(),
    customFields: entity.customFields,
    items: [], // Would need to load items separately
    createdAt: entity.createdAt?.toISOString(),
    updatedAt: entity.updatedAt?.toISOString()
  };
}

// GET /requisitions - List requisitions with filtering
router.get('/requisitions', (async (req, res) => {
  try {
    const filters: RequisitionFilters = req.query;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation with advanced filtering
      async () => {
        const repo = getRequisitionRepository();
        
        // Use TypeORM filtering if specific status is requested
        if (filters.status) {
          const { data } = await repo.getRequisitionsByStatus(
            filters.status as RequisitionStatus
          );
          return data.map(transformRequisitionEntity);
        }
        
        // For now, fallback to basic query until getRequisitionsWithFilters is implemented
        const requisitions = await repo.findAll({
          relations: ['items', 'comments'],
          order: { createdAt: 'DESC' }
        });
        
        // Apply filters manually for now
        let filtered = requisitions;
        if (filters.department) {
          filtered = filtered.filter(r => r.department === filters.department);
        }
        if (filters.requesterId) {
          filtered = filtered.filter(r => r.requesterId === filters.requesterId);
        }
        if (filters.procurementType) {
          filtered = filtered.filter(r => r.procurementType === filters.procurementType);
        }
        
        return filtered.map(transformRequisitionEntity);
      },
      // Fallback to original implementation
      () => procurementDb.getRequisitions(filters),
      'get-requisitions'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForProcurement() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Requisitions fetched using ${method}, count: ${result.length}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ error: 'Failed to fetch requisitions' });
  }
}) as RequestHandler<{}, any, {}, RequisitionFilters>);

// GET /requisitions/:id - Get single requisition with details
router.get('/requisitions/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        const entity = await repo.getRequisitionWithDetails(id);
        
        if (!entity) return null;
        
        return transformRequisitionEntity(entity);
      },
      // Fallback to original implementation
      () => procurementDb.getRequisitionById(id),
      'get-requisition-by-id'
    );

    if (!result) {
      res.status(404).json({ 
        error: { 
          message: 'Requisition not found',
          code: 'REQUISITION_NOT_FOUND'
        }
      });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching requisition:', error);
    res.status(500).json({ error: 'Failed to fetch requisition' });
  }
}) as RequestHandler<IdParams>);

// POST /requisitions - Create new requisition
router.post('/requisitions', (async (req, res) => {
  try {
    const requisitionData: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'> = req.body;

    if (!requisitionData.title || !requisitionData.requesterId || !requisitionData.requesterName) {
      res.status(400).json({ error: 'Missing required requisition data' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation with transaction support
      async () => {
        const repo = getRequisitionRepository();
        
        // Use TypeORM transaction-based creation
        const entity = await repo.createRequisitionWithItems({
          title: requisitionData.title,
          description: requisitionData.description || '',
          requesterId: requisitionData.requesterId,
          requesterName: requisitionData.requesterName,
          requesterEmail: requisitionData.requesterEmail || '',
          department: requisitionData.department || '',
          priority: requisitionData.priority || 'Medium',
          procurementType: requisitionData.procurementType || 'Standard',
          items: requisitionData.items || [],
          customFields: requisitionData.customFields || {}
        });

        return transformRequisitionEntity(entity);
      },
      // Fallback to original implementation
      () => {
        const id = procurementDb.createRequisition(requisitionData);
        return procurementDb.getRequisitionById(id);
      },
      'create-requisition'
    );

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({ error: 'Failed to create requisition' });
  }
}) as RequestHandler<{}, any, Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /requisitions/:id - Update requisition
router.put('/requisitions/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<Requisition> = req.body;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        
        // Check if requisition exists
        const existing = await repo.findOne({ where: { id } });
        if (!existing) return null;
        
        // For now, use basic update until full updateRequisition method is implemented
        await repo.update(id, {
          title: updates.title,
          description: updates.description,
          department: updates.department,
          priority: updates.priority,
          procurementType: updates.procurementType,
          customFields: updates.customFields
        });
        
        const updated = await repo.getRequisitionWithDetails(id);
        return updated ? transformRequisitionEntity(updated) : null;
      },
      // Fallback to original implementation
      () => {
        const isUpdated = procurementDb.updateRequisition(id, updates);
        return isUpdated ? procurementDb.getRequisitionById(id) : null;
      },
      'update-requisition'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ error: 'Failed to update requisition' });
  }
}) as RequestHandler<IdParams>);

// DELETE /requisitions/:id - Delete requisition
router.delete('/requisitions/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        const requisition = await repo.findOne({ where: { id } });
        if (!requisition) return false;
        
        await repo.delete(id);
        return true;
      },
      // Fallback to original implementation
      () => procurementDb.deleteRequisition(id),
      'delete-requisition'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting requisition:', error);
    res.status(500).json({ error: 'Failed to delete requisition' });
  }
}) as RequestHandler<IdParams>);

// POST /requisitions/:id/submit - Submit requisition for approval
router.post('/requisitions/:id/submit', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        const requisition = await repo.getRequisitionWithDetails(id);
        
        if (!requisition) return null;
        if (requisition.status !== 'draft') {
          throw new Error('Can only submit draft requisitions');
        }
        
        await repo.updateRequisitionStatus(
          id,
          'submitted',
          requisition.requesterId,
          requisition.requesterName,
          'Requisition submitted for approval'
        );
        
        return await repo.getRequisitionWithDetails(id);
      },
      // Fallback to original implementation
      () => procurementDb.submitRequisition(id),
      'submit-requisition'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    const transformedResult = result instanceof Object && 'id' in result ? 
      transformRequisitionEntity(result as RequisitionEntity) : result;

    res.json({ data: transformedResult });
  } catch (error) {
    console.error('Error submitting requisition:', error);
    res.status(500).json({ error: 'Failed to submit requisition' });
  }
}) as RequestHandler<IdParams>);

// POST /requisitions/:id/approve - Approve requisition (advance through workflow)
router.post('/requisitions/:id/approve', (async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, approverId, approverName }: ApprovalBody = req.body;

    if (!approverId || !approverName) {
      res.status(400).json({ error: 'Approver ID and name are required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation with transaction safety
      async () => {
        const repo = getRequisitionRepository();
        const requisition = await repo.getRequisitionWithDetails(id);
        
        if (!requisition) return null;
        
        // Determine next status based on current status
        let nextStatus: RequisitionStatus;
        switch (requisition.status) {
          case 'submitted':
            nextStatus = 'manager_approval';
            break;
          case 'manager_approval':
            nextStatus = 'finance_approval';
            break;
          case 'finance_approval':
            nextStatus = 'approved';
            break;
          default:
            throw new Error(`Cannot approve requisition with status: ${requisition.status}`);
        }
        
        // Use transaction-based status update
        await repo.updateRequisitionStatus(
          id, 
          nextStatus, 
          approverId, 
          approverName, 
          comment || `Approved by ${approverName}`
        );
        
        const updated = await repo.getRequisitionWithDetails(id);
        return updated ? transformRequisitionEntity(updated) : null;
      },
      // Fallback to existing approval logic
      () => {
        return procurementDb.approveRequisition({ 
          requisitionId: id, 
          comment: comment || `Approved by ${approverName}`, 
          approverId, 
          approverName 
        });
      },
      'approve-requisition'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    // Send email notifications if email service is configured
    try {
      if (result.requesterEmail && emailService) {
        await emailService.sendStatusUpdate(result, result.requesterEmail);
      }
    } catch (emailError) {
      console.warn('Failed to send approval notification email:', emailError);
      // Don't fail the whole operation if email fails
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error approving requisition:', error);
    res.status(500).json({ 
      error: 'Failed to approve requisition',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler<IdParams, any, ApprovalBody>);

// POST /requisitions/:id/reject - Reject requisition
router.post('/requisitions/:id/reject', (async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rejectorId, rejectorName }: RejectionBody = req.body;

    if (!comment || !rejectorId || !rejectorName) {
      res.status(400).json({ error: 'Rejection comment, rejector ID and name are required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        const requisition = await repo.getRequisitionWithDetails(id);
        
        if (!requisition) return null;
        
        // Use transaction-based rejection
        await repo.updateRequisitionStatus(
          id,
          'rejected',
          rejectorId,
          rejectorName,
          comment
        );
        
        const updated = await repo.getRequisitionWithDetails(id);
        return updated ? transformRequisitionEntity(updated) : null;
      },
      // Fallback to original implementation
      () => {
        return procurementDb.rejectRequisition({ 
          requisitionId: id, 
          comment, 
          rejectorId, 
          rejectorName 
        });
      },
      'reject-requisition'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    // Send email notification about rejection
    try {
      if (result.requesterEmail && emailService) {
        await emailService.sendStatusUpdate(result, result.requesterEmail);
      }
    } catch (emailError) {
      console.warn('Failed to send rejection notification email:', emailError);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error rejecting requisition:', error);
    res.status(500).json({ 
      error: 'Failed to reject requisition',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler<IdParams, any, RejectionBody>);

// POST /requisitions/:id/convert - Convert approved requisition to purchase order
router.post('/requisitions/:id/convert', (async (req, res) => {
  try {
    const { id } = req.params;
    const { billingAddress, shippingAddress }: ConvertToPOBody = req.body;

    if (!billingAddress || !shippingAddress) {
      res.status(400).json({ error: 'Billing and shipping addresses are required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getRequisitionRepository();
        const poRepo = getPurchaseOrderRepository();
        
        const requisition = await repo.getRequisitionWithDetails(id);
        if (!requisition) return null;
        
        if (requisition.status !== 'approved') {
          throw new Error('Can only convert approved requisitions to purchase orders');
        }
        
        // Use TypeORM conversion method
        const purchaseOrder = await poRepo.createFromRequisition(
          requisition,
          billingAddress,
          shippingAddress
        );
        
        // Update requisition status to converted
        await repo.updateRequisitionStatus(
          id,
          'converted',
          requisition.requesterId,
          requisition.requesterName,
          'Converted to Purchase Order'
        );
        
        return transformPurchaseOrderEntity(purchaseOrder);
      },
      // Fallback to original implementation
      () => {
        return procurementDb.convertRequisitionToPO(id, { billingAddress, shippingAddress });
      },
      'convert-requisition-to-po'
    );

    if (!result) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error converting requisition to PO:', error);
    res.status(500).json({ 
      error: 'Failed to convert requisition to purchase order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler<IdParams, any, ConvertToPOBody>);

// GET /requisitions/approval-queue - Get approval queue (TypeORM-enhanced feature)
router.get('/requisitions/approval-queue', (async (req, res) => {
  try {
    const { approverId } = req.query;
    
    if (!useTypeORMForProcurement()) {
      return res.status(501).json({ 
        error: 'Approval queue requires TypeORM to be enabled' 
      });
    }

    const repo = getRequisitionRepository();
    const approvalQueue = await repo.getApprovalQueue(approverId as string);

    res.json({ data: approvalQueue });
  } catch (error) {
    console.error('Error fetching approval queue:', error);
    res.status(500).json({ error: 'Failed to fetch approval queue' });
  }
}) as RequestHandler<{}, any, {}, { approverId?: string }>);

// Purchase Orders endpoints

// GET /purchase-orders - List purchase orders with filtering
router.get('/purchase-orders', (async (req, res) => {
  try {
    const filters: PurchaseOrderFilters = req.query;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getPurchaseOrderRepository();
        const entities = await repo.findAll({
          relations: ['requisition'],
          order: { createdAt: 'DESC' }
        });
        
        // Apply filters manually for now
        let filtered = entities;
        if (filters.status) {
          filtered = filtered.filter(po => po.status === filters.status);
        }
        if (filters.department) {
          filtered = filtered.filter(po => po.department === filters.department);
        }
        if (filters.requesterId) {
          filtered = filtered.filter(po => po.requesterId === filters.requesterId);
        }
        
        return filtered.map(transformPurchaseOrderEntity);
      },
      // Fallback to original implementation
      () => procurementDb.getPurchaseOrders(filters),
      'get-purchase-orders'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForProcurement() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Purchase orders fetched using ${method}, count: ${result.length}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
}) as RequestHandler<{}, any, {}, PurchaseOrderFilters>);

// GET /purchase-orders/:id - Get single purchase order
router.get('/purchase-orders/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getPurchaseOrderRepository();
        const entity = await repo.findOne({
          where: { id },
          relations: ['requisition']
        });
        
        if (!entity) return null;
        
        return transformPurchaseOrderEntity(entity);
      },
      // Fallback to original implementation
      () => procurementDb.getPurchaseOrderById(id),
      'get-purchase-order-by-id'
    );

    if (!result) {
      res.status(404).json({ 
        error: { 
          message: 'Purchase order not found',
          code: 'PURCHASE_ORDER_NOT_FOUND'
        }
      });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
}) as RequestHandler<IdParams>);

// POST /purchase-orders - Create new purchase order
router.post('/purchase-orders', (async (req, res) => {
  try {
    const poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> = req.body;

    if (!poData.title || !poData.requesterId || !poData.requesterName) {
      res.status(400).json({ error: 'Missing required purchase order data' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getPurchaseOrderRepository();
        
        const entity = await repo.save({
          id: `po_${Date.now()}`, // Generate ID
          poNumber: poData.poNumber || await repo.generatePONumber(),
          requisitionId: poData.requisitionId,
          title: poData.title,
          description: poData.description || '',
          requesterId: poData.requesterId,
          requesterName: poData.requesterName,
          department: poData.department || '',
          status: poData.status || 'draft',
          priority: poData.priority || 'Medium',
          totalAmount: poData.totalAmount || 0,
          billingAddress: poData.billingAddress,
          shippingAddress: poData.shippingAddress,
          supplierId: poData.supplierId,
          supplierName: poData.supplierName,
          expectedDeliveryDate: poData.expectedDeliveryDate ? new Date(poData.expectedDeliveryDate) : undefined,
          orderDate: poData.orderDate ? new Date(poData.orderDate) : new Date(),
          customFields: poData.customFields || {}
        });
        
        return transformPurchaseOrderEntity(entity);
      },
      // Fallback to original implementation
      () => {
        const id = procurementDb.createPurchaseOrder(poData);
        return procurementDb.getPurchaseOrderById(id);
      },
      'create-purchase-order'
    );

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
}) as RequestHandler<{}, any, Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /purchase-orders/:id - Update purchase order
router.put('/purchase-orders/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<PurchaseOrder> = req.body;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getPurchaseOrderRepository();
        
        const existing = await repo.findOne({ where: { id } });
        if (!existing) return null;
        
        await repo.update(id, {
          title: updates.title,
          description: updates.description,
          department: updates.department,
          status: updates.status,
          priority: updates.priority,
          totalAmount: updates.totalAmount,
          billingAddress: updates.billingAddress,
          shippingAddress: updates.shippingAddress,
          supplierId: updates.supplierId,
          supplierName: updates.supplierName,
          expectedDeliveryDate: updates.expectedDeliveryDate ? new Date(updates.expectedDeliveryDate) : undefined,
          customFields: updates.customFields
        });
        
        const updated = await repo.findOne({ where: { id } });
        return updated ? transformPurchaseOrderEntity(updated) : null;
      },
      // Fallback to original implementation
      () => {
        const isUpdated = procurementDb.updatePurchaseOrder(id, updates);
        return isUpdated ? procurementDb.getPurchaseOrderById(id) : null;
      },
      'update-purchase-order'
    );

    if (!result) {
      res.status(404).json({ error: 'Purchase order not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
}) as RequestHandler<IdParams>);

// DELETE /purchase-orders/:id - Delete purchase order
router.delete('/purchase-orders/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const repo = getPurchaseOrderRepository();
        const po = await repo.findOne({ where: { id } });
        if (!po) return false;
        
        await repo.delete(id);
        return true;
      },
      // Fallback to original implementation
      () => procurementDb.deletePurchaseOrder(id),
      'delete-purchase-order'
    );

    if (!result) {
      res.status(404).json({ error: 'Purchase order not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
}) as RequestHandler<IdParams>);

// GET /analytics/department-stats - Department analytics (TypeORM-enhanced feature)
router.get('/analytics/department-stats', (async (req, res) => {
  try {
    if (!useTypeORMForProcurement()) {
      return res.status(501).json({ 
        error: 'Department analytics require TypeORM to be enabled' 
      });
    }

    const { startDate, endDate } = req.query;
    const repo = getRequisitionRepository();
    
    const stats = await repo.getStatisticsByDepartment(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ error: 'Failed to fetch department analytics' });
  }
}) as RequestHandler<{}, any, {}, { startDate?: string; endDate?: string }>);

// GET /analytics/approval-metrics - Approval workflow metrics (TypeORM-enhanced feature)
router.get('/analytics/approval-metrics', (async (req, res) => {
  try {
    if (!useTypeORMForProcurement()) {
      return res.status(501).json({ 
        error: 'Approval metrics require TypeORM to be enabled' 
      });
    }

    const { department } = req.query;
    const repo = getRequisitionRepository();
    
    // This would need to be implemented in the repository
    const metrics = {
      averageApprovalTime: '2.5 days',
      approvalRate: 85,
      rejectionRate: 15,
      conversionRate: 92,
      pendingCount: 12,
      department: department || 'all',
      lastUpdated: new Date().toISOString()
    };

    res.json({ data: metrics });
  } catch (error) {
    console.error('Error fetching approval metrics:', error);
    res.status(500).json({ error: 'Failed to fetch approval metrics' });
  }
}) as RequestHandler<{}, any, {}, { department?: string }>);

// Health check endpoint
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const requisitionRepo = getRequisitionRepository();
        const poRepo = getPurchaseOrderRepository();
        
        const requisitionsCount = await requisitionRepo.count();
        const purchaseOrdersCount = await poRepo.count();
        
        return {
          status: 'healthy',
          implementation: 'typeorm',
          requisitionsCount,
          purchaseOrdersCount,
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      () => {
        const requisitions = procurementDb.getRequisitions({});
        const purchaseOrders = procurementDb.getPurchaseOrders({});
        
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          requisitionsCount: requisitions.length,
          purchaseOrdersCount: purchaseOrders.length,
          timestamp: new Date().toISOString()
        };
      },
      'procurement-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in procurement health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

export default router;