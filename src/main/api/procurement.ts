import { Router, Request, Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as db from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Requisition, PurchaseOrder, Address, RequisitionItem, RequisitionComment, RequisitionStatus } from '../../shared/types';
import { EmailService } from '../services/email-service';

const emailService = new EmailService();

const procurementRouter = Router();

// Type helper for request handlers
type TypedRequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = any> =
  RequestHandler<P, ResBody, ReqBody, ReqQuery>;

// Enhanced type definitions for request parameters
interface WithId extends ParamsDictionary {
  id: string;
}

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

// Requisition endpoints
procurementRouter.get('/requisitions', (async (req: Request<{}, {}, {}, RequisitionFilters>, res: Response) => {
  try {
    const { status, department, requesterId, procurementType } = req.query;
    const filters: any = {};
    
    if (status) filters.status = status;
    if (department) filters.department = department;
    if (requesterId) filters.requesterId = requesterId;
    if (procurementType) filters.procurementType = procurementType;
    
    const requisitions = await db.getRequisitions(filters);
    res.json({ data: requisitions });
  } catch (err) {
    console.error('Error getting requisitions:', err);
    res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        code: 'FETCH_REQUISITIONS_ERROR'
      }
    });
  }
}) as TypedRequestHandler<{}, any, {}, RequisitionFilters>);

procurementRouter.route('/requisitions/:id')
  .get((async (req: Request<WithId>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      res.json({ data: requisition });
    } catch (err) {
      console.error(`Error getting requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'FETCH_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId>)
  .put((async (req: Request<WithId, {}, Requisition>, res: Response) => {
    try {
      const existingRequisition = await db.getRequisitionById(req.params.id);
      
      if (!existingRequisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      const requisitionData = req.body as Requisition;
      
      // Validate that the IDs match
      if (requisitionData.id !== req.params.id) {
        return res.status(400).json({ 
          error: { 
            message: 'Request body ID must match URL parameter',
            code: 'ID_MISMATCH'
          }
        });
      }
      
      // Update timestamp
      requisitionData.updatedAt = new Date().toISOString();
      
      // Ensure all items have the correct requisitionId
      requisitionData.items.forEach((item: RequisitionItem) => {
        item.requisitionId = requisitionData.id;
        if (!item.id) {
          item.id = uuidv4();
        }
      });
      
      // Ensure all comments have the correct requisitionId and an ID
      requisitionData.comments.forEach((comment: RequisitionComment) => {
        comment.requisitionId = requisitionData.id;
        if (!comment.id) {
          comment.id = uuidv4();
        }
        if (!comment.createdAt) {
          comment.createdAt = new Date().toISOString();
        }
      });
      
      const updatedRequisition = await db.updateRequisition(requisitionData);
      res.json({ data: updatedRequisition });
    } catch (err) {
      console.error(`Error updating requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'UPDATE_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId, {}, Requisition>)
  .delete((async (req: Request<WithId>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      await db.deleteRequisition(req.params.id);
      res.status(204).end();
    } catch (err) {
      console.error(`Error deleting requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'DELETE_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId>);

procurementRouter.post('/requisitions', (async (req: Request<{}, {}, Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>>, res: Response) => {
  try {
    const requisitionData = req.body as Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>;
    const now = new Date().toISOString();
    
    const newRequisition: Requisition = {
      ...requisitionData,
      id: uuidv4(),
      status: 'draft', // Always start with draft status
      createdAt: now,
      updatedAt: now,
      items: requisitionData.items.map((item: RequisitionItem) => ({
        ...item,
        id: item.id || uuidv4(),
        requisitionId: '' // Will be set to the requisition ID after creation
      })),
      comments: requisitionData.comments?.map((comment: RequisitionComment) => ({
        ...comment,
        id: comment.id || uuidv4(),
        requisitionId: '', // Will be set to the requisition ID after creation
        createdAt: comment.createdAt || now
      })) || []
    };
    
    // Set the requisitionId for all items and comments
    newRequisition.items.forEach((item: RequisitionItem) => {
      item.requisitionId = newRequisition.id;
    });
    
    newRequisition.comments.forEach((comment: RequisitionComment) => {
      comment.requisitionId = newRequisition.id;
    });
    
    const savedRequisition = await db.createRequisition(newRequisition);
    res.status(201).json(savedRequisition);
  } catch (err) {
    console.error('Error creating requisition:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}) as TypedRequestHandler<{}, any, Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>>);

procurementRouter.route('/requisitions/:id/submit')
  .post((async (req: Request<WithId>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      // Can only submit draft requisitions
      if (requisition.status !== 'draft') {
        return res.status(400).json({ 
          error: { 
            message: 'Only draft requisitions can be submitted',
            code: 'INVALID_STATUS_TRANSITION'
          }
        });
      }
      
      // Update status and save
      requisition.status = 'submitted';
      requisition.updatedAt = new Date().toISOString();
      
      const updatedRequisition = await db.updateRequisition(requisition);
      res.json({ data: updatedRequisition });
    } catch (err) {
      console.error(`Error submitting requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'SUBMIT_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId>);

procurementRouter.route('/requisitions/:id/approve')
  .post((async (req: Request<WithId>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }

      const { comment, approverId, approverName } = req.body;
      
      // Update status based on current status
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
          return res.status(400).json({ 
            error: { 
              message: 'Invalid status transition',
              code: 'INVALID_STATUS_TRANSITION',
              details: { currentStatus: requisition.status }
            }
          });
      }

      const updatedRequisition = await db.updateRequisition({
        ...requisition,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        approverId: approverId || requisition.approverId,
        approverName: approverName || requisition.approverName,
        comments: [
          ...requisition.comments,
          {
            id: uuidv4(),
            requisitionId: requisition.id,
            userId: approverId || 'system',
            userName: approverName || 'System',
            text: comment || `Status updated to ${nextStatus}`,
            createdAt: new Date().toISOString(),
            type: 'approval'
          }
        ]
      });

      // Send email notifications
      if (updatedRequisition.requesterEmail) {
        await emailService.sendStatusUpdate(updatedRequisition, updatedRequisition.requesterEmail);
      }

      // If moving to a new approval stage, notify the next approver
      if (nextStatus === 'manager_approval' && process.env.MANAGER_EMAIL) {
        await emailService.sendApprovalRequest(updatedRequisition, process.env.MANAGER_EMAIL);
      } else if (nextStatus === 'finance_approval' && process.env.FINANCE_EMAIL) {
        await emailService.sendApprovalRequest(updatedRequisition, process.env.FINANCE_EMAIL);
      }
      
      res.json({ data: updatedRequisition });
    } catch (err) {
      console.error(`Error approving requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'APPROVE_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId, {}, { comment?: string; approverId?: string; approverName?: string }>);

procurementRouter.route('/requisitions/:id/reject')
  .post((async (req: Request<WithId, {}, { comment: string; rejectorId?: string; rejectorName?: string }>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      const { comment, rejectorId, rejectorName } = req.body;
      
      if (!comment) {
        return res.status(400).json({ 
          error: { 
            message: 'Comment is required for rejection',
            code: 'MISSING_REJECTION_COMMENT'
          }
        });
      }
      
      const updatedRequisition = await db.updateRequisition({
        ...requisition,
        status: 'rejected',
        updatedAt: new Date().toISOString(),
        comments: [
          ...requisition.comments,
          {
            id: uuidv4(),
            requisitionId: requisition.id,
            userId: rejectorId || 'system',
            userName: rejectorName || 'System',
            text: comment,
            createdAt: new Date().toISOString(),
            type: 'rejection'
          }
        ]
      });

      // Send rejection notification to requester
      if (updatedRequisition.requesterEmail) {
        await emailService.sendStatusUpdate(updatedRequisition, updatedRequisition.requesterEmail);
      }
      
      res.json({ data: updatedRequisition });
    } catch (err) {
      console.error(`Error rejecting requisition ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'REJECT_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId, {}, { comment: string; rejectorId?: string; rejectorName?: string }>);

// Purchase Order endpoints
procurementRouter.get('/purchase-orders', (async (req: Request<{}, {}, {}, PurchaseOrderFilters>, res: Response) => {
  try {
    const { status, department, requesterId } = req.query;
    const filters: any = {};
    
    if (status) filters.status = status;
    if (department) filters.department = department;
    if (requesterId) filters.requesterId = requesterId;
    
    const purchaseOrders = await db.getPurchaseOrders(filters);
    res.json({ data: purchaseOrders });
  } catch (err) {
    console.error('Error getting purchase orders:', err);
    res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        code: 'FETCH_PURCHASE_ORDERS_ERROR'
      }
    });
  }
}) as TypedRequestHandler<{}, any, {}, PurchaseOrderFilters>);

procurementRouter.route('/purchase-orders/:id')
  .get((async (req: Request<WithId>, res: Response) => {
    try {
      const purchaseOrder = await db.getPurchaseOrderById(req.params.id);
      
      if (!purchaseOrder) {
        return res.status(404).json({ 
          error: { 
            message: 'Purchase order not found',
            code: 'PURCHASE_ORDER_NOT_FOUND'
          }
        });
      }
      
      res.json({ data: purchaseOrder });
    } catch (err) {
      console.error(`Error getting purchase order ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'FETCH_PURCHASE_ORDER_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId>)
  .put((async (req: Request<WithId, {}, PurchaseOrder>, res: Response) => {
    try {
      const existingPurchaseOrder = await db.getPurchaseOrderById(req.params.id);
      
      if (!existingPurchaseOrder) {
        return res.status(404).json({ 
          error: { 
            message: 'Purchase order not found',
            code: 'PURCHASE_ORDER_NOT_FOUND'
          }
        });
      }
      
      const purchaseOrderData = req.body as PurchaseOrder;
      
      // Validate that the IDs match
      if (purchaseOrderData.id !== req.params.id) {
        return res.status(400).json({ 
          error: { 
            message: 'Request body ID must match URL parameter',
            code: 'ID_MISMATCH'
          }
        });
      }
      
      // Update timestamp
      purchaseOrderData.updatedAt = new Date().toISOString();
      
      const updatedPurchaseOrder = await db.updatePurchaseOrder(purchaseOrderData);
      res.json({ data: updatedPurchaseOrder });
    } catch (err) {
      console.error(`Error updating purchase order ${req.params.id}:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'UPDATE_PURCHASE_ORDER_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId, {}, PurchaseOrder>);

procurementRouter.route('/requisitions/:id/convert')
  .post((async (req: Request<WithId, {}, ConvertToPOBody>, res: Response) => {
    try {
      const requisition = await db.getRequisitionById(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ 
          error: { 
            message: 'Requisition not found',
            code: 'REQUISITION_NOT_FOUND'
          }
        });
      }
      
      // Can only convert approved requisitions
      if (requisition.status !== 'approved') {
        return res.status(400).json({ 
          error: { 
            message: 'Only approved requisitions can be converted to purchase orders',
            code: 'INVALID_STATUS_TRANSITION'
          }
        });
      }

      // Check if billing and shipping addresses are provided
      const { billingAddress, shippingAddress } = req.body;
      if (!billingAddress || !shippingAddress) {
        return res.status(400).json({ 
          error: { 
            message: 'Billing and shipping addresses are required',
            code: 'MISSING_ADDRESS_INFO'
          }
        });
      }

      // Generate a purchase order number
      const orderNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      // Create purchase order from requisition
      const purchaseOrderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> = {
        requisitionId: requisition.id,
        orderNumber,
        title: requisition.title,
        description: requisition.description,
        status: 'draft',
        items: requisition.items.map(item => ({
          ...item,
          id: uuidv4(),
          purchaseOrderId: '', // Will be set after PO creation
          requisitionItemId: item.id
        })),
        department: requisition.department,
        requesterId: requisition.requesterId,
        requesterName: requisition.requesterName,
        priority: requisition.priority,
        procurementType: requisition.procurementType,
        customFields: requisition.customFields,
        billingAddress,
        shippingAddress,
        totalAmount: requisition.totalAmount,
        currency: requisition.currency,
        attachmentIds: requisition.attachmentIds || []
      };
      
      const savedPurchaseOrder = await db.createPurchaseOrder(purchaseOrderData);
      
      // Update requisition status
      requisition.status = 'converted';
      requisition.updatedAt = new Date().toISOString();
      await db.updateRequisition(requisition);
      
      res.status(201).json({ data: savedPurchaseOrder });
    } catch (err) {
      console.error(`Error converting requisition ${req.params.id} to purchase order:`, err);
      res.status(500).json({ 
        error: { 
          message: 'Internal server error',
          code: 'CONVERT_REQUISITION_ERROR'
        }
      });
    }
  }) as TypedRequestHandler<WithId, {}, ConvertToPOBody>);

procurementRouter.post('/purchase-orders', (async (req: Request<{}, {}, Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>, res: Response) => {
  try {
    const purchaseOrderData = req.body;
    
    // Handle system user defaults
    if (purchaseOrderData.requesterId === 'system-user') {
      purchaseOrderData.requesterName = 'System';
    }
    
    const savedPurchaseOrder = await db.createPurchaseOrder(purchaseOrderData);
    res.status(201).json({ data: savedPurchaseOrder });
  } catch (err) {
    console.error('Error creating purchase order:', err);
    res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        code: 'CREATE_PURCHASE_ORDER_ERROR'
      }
    });
  }
}) as TypedRequestHandler<{}, any, Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>);

export default procurementRouter;