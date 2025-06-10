/**
 * Hybrid Returns API - Phase 1 TypeORM Migration
 * Implements gradual migration from better-sqlite3 to TypeORM for returns system
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { getSupplierReturnRepositoryTypeORM } from '../database/repository-factory';
import { 
  useTypeORMForReturns, 
  withTypeORMFallback, 
  enablePerformanceLogging,
  featureFlags
} from '../utils/feature-flags';

// Import existing SQLite functions for fallback
import { 
  getAllReturns as sqliteGetAllReturns, 
  getReturnsByOrderId as sqliteGetReturnsByOrderId,
  createReturn as sqliteCreateReturn,
  updateReturnStatus as sqliteUpdateReturnStatus, 
  addReturnNote as sqliteAddReturnNote, 
  updateReturn as sqliteUpdateReturn, 
  updateReturnWithProducts as sqliteUpdateReturnWithProducts, 
  createDraftReturn as sqliteCreateDraftReturn,
  deleteDraftReturn as sqliteDeleteDraftReturn,
  deleteReturnById as sqliteDeleteReturnById,
  updateReturnWithStatus as sqliteUpdateReturnWithStatus,
  createReturnFromOrder as sqliteCreateReturnFromOrder,
  getReturnById as sqliteGetReturnById
} from '../database/returns';

const router = Router();

/**
 * GET /api/returns - Get all returns with optional filtering
 * Phase 1: Basic TypeORM implementation with fallback
 */
const getAllReturnsHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = req.query.orderId as string | undefined;
    const status = req.query.status as string | undefined;
    const followUpAction = req.query.followUpAction as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      // TypeORM implementation
      const repository = getSupplierReturnRepositoryTypeORM();
      
      let returns;
      if (orderId && !isNaN(Number(orderId))) {
        // For now, fall back to SQLite for orderID queries (will implement in Phase 2)
        returns = await withTypeORMFallback(
          async () => {
            throw new Error('Order ID filtering not yet implemented in TypeORM');
          },
          () => {
            const sqliteReturns = sqliteGetReturnsByOrderId(Number(orderId));
            return sqliteReturns.map((row: any) => ({
              ...row,
              id: String(row.id),
              workflowId: row.workflow_id || undefined,
              products: JSON.parse(typeof row.products === 'string' ? row.products : '[]'),
              notes: JSON.parse(typeof row.notes === 'string' ? row.notes : '[]'),
              documents: JSON.parse(typeof row.documents === 'string' ? row.documents : '[]'),
              customFields: JSON.parse(typeof row.customFields === 'string' ? row.customFields : '{}'),
            }));
          },
          'get-returns-by-order-id'
        ) as any;
      } else {
        // Get all returns with TypeORM
        returns = await withTypeORMFallback(
          async () => {
            const filters: any = {};
            if (status) filters.status = status;
            if (followUpAction) filters.followUpAction = followUpAction;
            if (limit) filters.limit = limit;
            if (offset) filters.offset = offset;

            const typeormReturns = await repository.getAllReturns(filters);
            
            // Transform TypeORM entities to match expected format
            return typeormReturns.map(returnEntity => ({
              id: String(returnEntity.id),
              orderNumber: returnEntity.orderNumber,
              status: returnEntity.status,
              followUpAction: returnEntity.followUpAction,
              workflowId: returnEntity.workflowId,
              supplierReference: returnEntity.supplierReference,
              commissioningDate: returnEntity.commissioningDate,
              shippingDate: returnEntity.shippingDate,
              creditDate: returnEntity.creditDate,
              reconciliationDate: returnEntity.reconciliationDate,
              creditNoteNumber: returnEntity.creditNoteNumber,
              creditAmount: returnEntity.creditAmount,
              creditNoteStatus: returnEntity.creditNoteStatus,
              originalInvoiceNumber: returnEntity.originalInvoiceNumber,
              creditorNumber: returnEntity.creditorNumber,
              reconciliationInvoiceNumber: returnEntity.reconciliationInvoiceNumber,
              orderId: returnEntity.orderId,
              customFields: returnEntity.customFields || {},
              createdAt: returnEntity.createdAt,
              updatedAt: returnEntity.updatedAt,
              products: returnEntity.products || [],
              notes: returnEntity.notes || [],
              documents: returnEntity.documents || []
            }));
          },
          () => {
            const sqliteReturns = sqliteGetAllReturns();
            return sqliteReturns.map((row: any) => ({
              ...row,
              id: String(row.id),
              workflowId: row.workflow_id || undefined,
              products: JSON.parse(typeof row.products === 'string' ? row.products : '[]'),
              notes: JSON.parse(typeof row.notes === 'string' ? row.notes : '[]'),
              documents: JSON.parse(typeof row.documents === 'string' ? row.documents : '[]'),
              customFields: JSON.parse(typeof row.customFields === 'string' ? row.customFields : '{}'),
            }));
          },
          'get-all-returns'
        ) as any;
      }

      if (enablePerformanceLogging()) {
        console.log(`📊 Returns fetched using ${useTypeORMForReturns() ? 'TypeORM' : 'SQLite'}`);
      }

      res.json(returns);
      return;
    }

    // Fallback to SQLite implementation
    let returns;
    if (orderId && !isNaN(Number(orderId))) {
      returns = sqliteGetReturnsByOrderId(Number(orderId)).map(row => ({
        ...row,
        id: String(row.id),
        workflowId: row.workflow_id || undefined,
        products: JSON.parse(typeof row.products === 'string' ? row.products : '[]'),
        notes: JSON.parse(typeof row.notes === 'string' ? row.notes : '[]'),
        documents: JSON.parse(typeof row.documents === 'string' ? row.documents : '[]'),
        customFields: JSON.parse(typeof row.customFields === 'string' ? row.customFields : '{}'),
      }));
    } else {
      returns = sqliteGetAllReturns().map(row => ({
        ...row,
        id: String(row.id),
        workflowId: row.workflow_id || undefined,
        products: JSON.parse(typeof row.products === 'string' ? row.products : '[]'),
        notes: JSON.parse(typeof row.notes === 'string' ? row.notes : '[]'),
        documents: JSON.parse(typeof row.documents === 'string' ? row.documents : '[]'),
        customFields: JSON.parse(typeof row.customFields === 'string' ? row.customFields : '{}'),
      }));
    }

    res.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ 
      error: 'Failed to fetch returns',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/returns/:id - Get single return by ID
 * Phase 1: TypeORM implementation with fallback
 */
const getReturnByIdHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const returnId = parseInt(req.params.id);
    if (isNaN(returnId)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      const repository = getSupplierReturnRepositoryTypeORM();
      
      const returnData = await withTypeORMFallback(
        async () => {
          const returnEntity = await repository.getReturnById(returnId);
          if (!returnEntity) {
            return null;
          }

          return {
            id: String(returnEntity.id),
            orderNumber: returnEntity.orderNumber,
            status: returnEntity.status,
            followUpAction: returnEntity.followUpAction,
            workflowId: returnEntity.workflowId,
            supplierReference: returnEntity.supplierReference,
            commissioningDate: returnEntity.commissioningDate,
            shippingDate: returnEntity.shippingDate,
            creditDate: returnEntity.creditDate,
            reconciliationDate: returnEntity.reconciliationDate,
            creditNoteNumber: returnEntity.creditNoteNumber,
            creditAmount: returnEntity.creditAmount,
            creditNoteStatus: returnEntity.creditNoteStatus,
            originalInvoiceNumber: returnEntity.originalInvoiceNumber,
            creditorNumber: returnEntity.creditorNumber,
            reconciliationInvoiceNumber: returnEntity.reconciliationInvoiceNumber,
            orderId: returnEntity.orderId,
            customFields: returnEntity.customFields || {},
            createdAt: returnEntity.createdAt,
            updatedAt: returnEntity.updatedAt,
            products: returnEntity.products || [],
            notes: returnEntity.notes || [],
            documents: returnEntity.documents || [],
            workflow: returnEntity.workflow
          };
        },
        () => {
          const sqliteReturn = sqliteGetReturnById(returnId as any);
          if (!sqliteReturn) {
            return null;
          }
          return {
            ...sqliteReturn,
            id: String(sqliteReturn.id),
            workflowId: sqliteReturn.workflow_id || undefined,
            workflow: undefined, // SQLite doesn't include workflow object
            products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
            notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
            documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
            customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
          } as any;
        },
        'get-return-by-id'
      );

      if (!returnData) {
        res.status(404).json({ error: 'Return not found' });
        return;
      }

      res.json(returnData);
      return;
    }

    // Fallback to SQLite
    const sqliteReturn = sqliteGetReturnById(returnId as any);
    if (!sqliteReturn) {
      res.status(404).json({ error: 'Return not found' });
      return;
    }

    const returnData = {
      ...sqliteReturn,
      id: String(sqliteReturn.id),
      workflowId: sqliteReturn.workflow_id || undefined,
      products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
      notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
      documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
      customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
    };

    res.json(returnData);
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({ 
      error: 'Failed to fetch return',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/returns - Create new return
 * Phase 1: Basic TypeORM implementation with fallback
 */
const createReturnHandler: RequestHandler = async (req, res) => {
  try {
    const returnData = req.body;

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      const repository = getSupplierReturnRepositoryTypeORM();
      
      const newReturn = await withTypeORMFallback(
        async () => {
          const createdReturn = await repository.createReturn({
            orderNumber: returnData.orderNumber,
            status: returnData.status || 'Ausstehend',
            followUpAction: returnData.followUpAction,
            workflowId: returnData.workflowId,
            customFields: returnData.customFields,
            products: returnData.products
          });

          return {
            id: String(createdReturn.id),
            orderNumber: createdReturn.orderNumber,
            status: createdReturn.status,
            followUpAction: createdReturn.followUpAction,
            workflowId: createdReturn.workflowId,
            customFields: createdReturn.customFields || {},
            createdAt: createdReturn.createdAt,
            updatedAt: createdReturn.updatedAt,
            products: createdReturn.products || []
          };
        },
        () => {
          const createdId = sqliteCreateReturn(returnData);
          const sqliteReturn = sqliteGetReturnById(createdId as any);
          return {
            ...sqliteReturn,
            id: String(sqliteReturn.id),
            workflowId: sqliteReturn.workflow_id || undefined,
            products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
            notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
            documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
            customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
          } as any;
        },
        'create-return'
      );

      if (enablePerformanceLogging()) {
        console.log(`📊 Return created using ${useTypeORMForReturns() ? 'TypeORM' : 'SQLite'}`);
      }

      res.status(201).json(newReturn);
      return;
    }

    // Fallback to SQLite
    const createdId = sqliteCreateReturn(returnData);
    const sqliteReturn = sqliteGetReturnById(createdId as any);
    const newReturn = {
      ...sqliteReturn,
      id: String(sqliteReturn.id),
      workflowId: sqliteReturn.workflow_id || undefined,
      products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
      notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
      documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
      customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
    };

    res.status(201).json(newReturn);
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ 
      error: 'Failed to create return',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * PATCH /api/returns/:id - Update return
 * Phase 1: Basic TypeORM implementation with fallback
 */
const updateReturnHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const returnId = parseInt(req.params.id);
    if (isNaN(returnId)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    const updateData = req.body;

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      const repository = getSupplierReturnRepositoryTypeORM();
      
      const updatedReturn = await withTypeORMFallback(
        async () => {
          const updated = await repository.updateReturn(returnId, updateData);
          if (!updated) {
            return null;
          }

          return {
            id: String(updated.id),
            orderNumber: updated.orderNumber,
            status: updated.status,
            followUpAction: updated.followUpAction,
            workflowId: updated.workflowId,
            supplierReference: updated.supplierReference,
            commissioningDate: updated.commissioningDate,
            shippingDate: updated.shippingDate,
            creditDate: updated.creditDate,
            reconciliationDate: updated.reconciliationDate,
            creditNoteNumber: updated.creditNoteNumber,
            creditAmount: updated.creditAmount,
            creditNoteStatus: updated.creditNoteStatus,
            originalInvoiceNumber: updated.originalInvoiceNumber,
            creditorNumber: updated.creditorNumber,
            reconciliationInvoiceNumber: updated.reconciliationInvoiceNumber,
            orderId: updated.orderId,
            customFields: updated.customFields || {},
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            products: updated.products || [],
            notes: updated.notes || [],
            documents: updated.documents || []
          };
        },
        () => {
          sqliteUpdateReturn(returnId, updateData);
          const sqliteReturn = sqliteGetReturnById(returnId as any);
          if (!sqliteReturn) {
            return null;
          }
          return {
            ...sqliteReturn,
            id: String(sqliteReturn.id),
            workflowId: sqliteReturn.workflow_id || undefined,
            products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
            notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
            documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
            customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
          } as any;
        },
        'update-return'
      );

      if (!updatedReturn) {
        res.status(404).json({ error: 'Return not found' });
        return;
      }

      res.json(updatedReturn);
      return;
    }

    // Fallback to SQLite
    sqliteUpdateReturn(returnId, updateData);
    const sqliteReturn = sqliteGetReturnById(returnId as any);
    if (!sqliteReturn) {
      res.status(404).json({ error: 'Return not found' });
      return;
    }

    const updatedReturn = {
      ...sqliteReturn,
      id: String(sqliteReturn.id),
      workflowId: sqliteReturn.workflow_id || undefined,
      products: JSON.parse(typeof sqliteReturn.products === 'string' ? sqliteReturn.products : '[]'),
      notes: JSON.parse(typeof sqliteReturn.notes === 'string' ? sqliteReturn.notes : '[]'),
      documents: JSON.parse(typeof sqliteReturn.documents === 'string' ? sqliteReturn.documents : '[]'),
      customFields: JSON.parse(typeof sqliteReturn.customFields === 'string' ? sqliteReturn.customFields : '{}'),
    };

    res.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return:', error);
    res.status(500).json({ 
      error: 'Failed to update return',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * DELETE /api/returns/:id - Delete return
 * Phase 1: Basic TypeORM implementation with fallback
 */
const deleteReturnHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const returnId = parseInt(req.params.id);
    if (isNaN(returnId)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      const repository = getSupplierReturnRepositoryTypeORM();
      
      const deleted = await withTypeORMFallback(
        async () => {
          return await repository.deleteReturn(returnId);
        },
        () => {
          return sqliteDeleteReturnById(returnId);
        },
        'delete-return'
      );

      if (!deleted) {
        res.status(404).json({ error: 'Return not found' });
        return;
      }

      res.status(204).send();
      return;
    }

    // Fallback to SQLite
    const deleted = sqliteDeleteReturnById(returnId);
    if (!deleted) {
      res.status(404).json({ error: 'Return not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting return:', error);
    res.status(500).json({ 
      error: 'Failed to delete return',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/returns/:id/notes - Add note to return
 * Phase 1: TypeORM implementation with fallback
 */
const addNoteHandler: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const returnId = parseInt(req.params.id);
    if (isNaN(returnId)) {
      res.status(400).json({ error: 'Invalid return ID' });
      return;
    }

    const { content, author } = req.body;
    if (!content || !author) {
      res.status(400).json({ error: 'Content and author are required' });
      return;
    }

    if (useTypeORMForReturns() && featureFlags.shouldUseTypeORM(req.headers['user-id'] as string)) {
      const repository = getSupplierReturnRepositoryTypeORM();
      
      const note = await withTypeORMFallback(
        async () => {
          const createdNote = await repository.addNote(returnId, { content, author });
          return {
            id: String(createdNote.id),
            returnId: String(createdNote.returnId),
            content: createdNote.content,
            author: createdNote.author,
            createdAt: createdNote.createdAt
          };
        },
        () => {
          const noteId = sqliteAddReturnNote(returnId, content, author);
          return {
            id: String(noteId),
            returnId: String(returnId),
            content,
            author,
            createdAt: new Date().toISOString()
          };
        },
        'add-return-note'
      );

      res.status(201).json(note);
      return;
    }

    // Fallback to SQLite
    const noteId = sqliteAddReturnNote(returnId, content, author);
    const note = {
      id: String(noteId),
      returnId: String(returnId),
      content,
      author,
      createdAt: new Date().toISOString()
    };

    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ 
      error: 'Failed to add note',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Register routes
router.get('/', getAllReturnsHandler);
router.get('/:id', getReturnByIdHandler);
router.post('/', createReturnHandler);
router.patch('/:id', updateReturnHandler);
router.delete('/:id', deleteReturnHandler);
router.post('/:id/notes', addNoteHandler);

export { router as returnsHybridRouter };
export default router;