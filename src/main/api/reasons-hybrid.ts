import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as settingsDb from '../database/settings';
import { getReasonRepository, getReasonCategoryRepositoryTypeORM } from '../database/repositories';
import { ReturnReason, ReasonCategory, FollowUpAction } from '../../shared/types';

// TypeORM entity types (different from shared types)
import { ReturnReason as ReturnReasonEntity } from '../database/entities/settings/ReturnReason';
import { ReasonCategory as ReasonCategoryEntity } from '../database/entities/settings/ReasonCategory';
import { useTypeORMForReasons, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface IdParams extends ParamsDictionary { id: string }
interface ActionParams extends ParamsDictionary { action: string }

/**
 * Hybrid reasons API that can use TypeORM or fallback to better-sqlite3
 * Handles reason categories and return reasons management
 */
const router = Router();

// GET /reason-categories - List all reason categories
router.get('/reason-categories', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const grouped = await reasonRepo.getReasonsGroupedByCategory();
        
        // Transform to match legacy format
        return Object.entries(grouped).map(([categoryName, reasons]) => {
          const firstReason = reasons[0];
          return {
            id: firstReason?.categoryId || categoryName,
            name: categoryName,
            order: 0, // Could be enhanced to get from category
            reasons: reasons
          };
        });
      },
      // Fallback to original implementation
      () => {
        const categories = settingsDb.getAllCategories();
        return categories.map(cat => ({
          ...cat,
          reasons: [] // Add empty reasons array for compatibility
        }));
      },
      'get-all-reason-categories'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForReasons() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Reason categories fetched using ${method}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching reason categories:', error);
    res.status(500).json({ error: 'Failed to fetch reason categories' });
  }
}) as RequestHandler);

// GET /reason-categories/:id - Get specific reason category
router.get('/reason-categories/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const categoryRepo = getReasonCategoryRepositoryTypeORM();
        const category = await categoryRepo.findOne({
          where: { id },
          relations: ['reasons']
        });
        
        if (!category) return null;
        
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          order: category.orderIndex,
          reasons: category.reasons || []
        };
      },
      // Fallback to original implementation
      () => {
        const category = settingsDb.getCategoryById(id);
        if (!category) return null;
        return {
          ...category,
          reasons: [] // Add empty reasons array for compatibility
        };
      },
      'get-reason-category-by-id'
    );

    if (!result) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}) as RequestHandler<IdParams>);

// POST /reason-categories - Create new reason category
router.post('/reason-categories', (async (req, res) => {
  try {
    const category: Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!category.name) {
      res.status(400).json({ error: 'Missing required category data' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const categoryRepo = getReasonCategoryRepositoryTypeORM();
        const created = await categoryRepo.save({
          id: `category_${Date.now()}`, // Generate ID
          name: category.name,
          description: category.description,
          orderIndex: category.order || 0
        });
        // Transform to match types.ts interface
        return {
          id: created.id,
          name: created.name,
          description: created.description,
          order: created.orderIndex,
          createdAt: created.createdAt?.toISOString(),
          updatedAt: created.updatedAt?.toISOString()
        };
      },
      // Fallback to original implementation
      () => {
        const id = settingsDb.createCategory(category);
        return settingsDb.getCategoryById(id);
      },
      'create-reason-category'
    );

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}) as RequestHandler<{}, any, Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /reason-categories/:id - Update reason category
router.put('/reason-categories/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<ReasonCategory> = req.body;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const categoryRepo = getReasonCategoryRepositoryTypeORM();
        await categoryRepo.update(id, updates);
        const updated = await categoryRepo.findOne({ where: { id } });
        if (!updated) return null;
        
        // Transform to match types.ts interface
        return {
          id: updated.id,
          name: updated.name,
          description: updated.description,
          order: updated.orderIndex,
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString()
        };
      },
      // Fallback to original implementation
      () => {
        const isUpdated = settingsDb.updateCategory(id, updates);
        return isUpdated ? settingsDb.getCategoryById(id) : null;
      },
      'update-reason-category'
    );

    if (!result) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}) as RequestHandler<IdParams>);

// DELETE /reason-categories/:id - Delete reason category
router.delete('/reason-categories/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const categoryRepo = getReasonCategoryRepositoryTypeORM();
        const category = await categoryRepo.findOne({ where: { id } });
        if (!category) return false;
        
        await categoryRepo.delete(id);
        return true;
      },
      // Fallback to original implementation
      () => settingsDb.deleteCategory(id),
      'delete-reason-category'
    );

    if (!result) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}) as RequestHandler<IdParams>);

// GET /reasons - List all reasons
router.get('/reasons', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const entities = await reasonRepo.findAll({
          relations: ['category'],
          order: { name: 'ASC' }
        });
        
        // Transform TypeORM entities to shared types
        return entities.map((entity: ReturnReasonEntity): ReturnReason => ({
          id: entity.id,
          code: entity.code,
          name: entity.name,
          description: entity.description,
          categoryId: entity.categoryId,
          isActive: entity.isActive,
          applicableActions: entity.applicableActions || [],
          createdAt: entity.createdAt?.toISOString(),
          updatedAt: entity.updatedAt?.toISOString()
        }));
      },
      // Fallback to original implementation
      () => settingsDb.getAllReasons(),
      'get-all-reasons'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForReasons() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Reasons fetched using ${method}, count: ${result.length}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching return reasons:', error);
    res.status(500).json({ error: 'Failed to fetch return reasons' });
  }
}) as RequestHandler);

// GET /reasons/by-action/:action - Get reasons by follow-up action
router.get('/reasons/by-action/:action', (async (req, res) => {
  try {
    const { action } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const entities = await reasonRepo.getReasonsForActions([action as FollowUpAction]);
        
        // Transform TypeORM entities to shared types
        return entities.map((entity: ReturnReasonEntity): ReturnReason => ({
          id: entity.id,
          code: entity.code,
          name: entity.name,
          description: entity.description,
          categoryId: entity.categoryId,
          isActive: entity.isActive,
          applicableActions: entity.applicableActions || [],
          createdAt: entity.createdAt?.toISOString(),
          updatedAt: entity.updatedAt?.toISOString()
        }));
      },
      // Fallback to original implementation
      () => settingsDb.getReasonsByAction(action as FollowUpAction),
      'get-reasons-by-action'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching reasons by action:', error);
    res.status(500).json({ error: 'Failed to fetch reasons by action' });
  }
}) as RequestHandler<ActionParams>);

// GET /reasons/:id - Get specific reason
router.get('/reasons/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const entity = await reasonRepo.findOne({
          where: { id },
          relations: ['category']
        });
        
        if (!entity) return null;
        
        // Transform TypeORM entity to shared type
        return {
          id: entity.id,
          code: entity.code,
          name: entity.name,
          description: entity.description,
          categoryId: entity.categoryId,
          isActive: entity.isActive,
          applicableActions: entity.applicableActions || [],
          createdAt: entity.createdAt?.toISOString(),
          updatedAt: entity.updatedAt?.toISOString()
        };
      },
      // Fallback to original implementation
      () => settingsDb.getReasonById(id),
      'get-reason-by-id'
    );

    if (!result) {
      res.status(404).json({ error: 'Reason not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching reason:', error);
    res.status(500).json({ error: 'Failed to fetch reason' });
  }
}) as RequestHandler<IdParams>);

// POST /reasons - Create new reason
router.post('/reasons', (async (req, res) => {
  try {
    const reason: Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!reason.name || !reason.categoryId || !reason.code) {
      res.status(400).json({ error: 'Missing required reason data' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const created = await reasonRepo.save({
          id: `reason_${Date.now()}`, // Generate ID
          code: reason.code,
          name: reason.name,
          description: reason.description,
          categoryId: reason.categoryId,
          isActive: reason.isActive !== false,
          applicableActions: reason.applicableActions || []
        });
        
        // Transform to shared type
        return {
          id: created.id,
          code: created.code,
          name: created.name,
          description: created.description,
          categoryId: created.categoryId,
          isActive: created.isActive,
          applicableActions: created.applicableActions || [],
          createdAt: created.createdAt?.toISOString(),
          updatedAt: created.updatedAt?.toISOString()
        };
      },
      // Fallback to original implementation
      () => {
        const id = settingsDb.createReason(reason);
        return settingsDb.getReasonById(id);
      },
      'create-reason'
    );

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating reason:', error);
    res.status(500).json({ error: 'Failed to create reason' });
  }
}) as RequestHandler<{}, any, Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /reasons/:id - Update reason
router.put('/reasons/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<ReturnReason> = req.body;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        await reasonRepo.update(id, updates);
        const updated = await reasonRepo.findOne({ 
          where: { id },
          relations: ['category']
        });
        
        if (!updated) return null;
        
        // Transform to shared type
        return {
          id: updated.id,
          code: updated.code,
          name: updated.name,
          description: updated.description,
          categoryId: updated.categoryId,
          isActive: updated.isActive,
          applicableActions: updated.applicableActions || [],
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString()
        };
      },
      // Fallback to original implementation
      () => {
        const isUpdated = settingsDb.updateReason(id, updates);
        return isUpdated ? settingsDb.getReasonById(id) : null;
      },
      'update-reason'
    );

    if (!result) {
      res.status(404).json({ error: 'Reason not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating reason:', error);
    res.status(500).json({ error: 'Failed to update reason' });
  }
}) as RequestHandler<IdParams>);

// DELETE /reasons/:id - Delete reason
router.delete('/reasons/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const reasonRepo = getReasonRepository();
        const reason = await reasonRepo.findOne({ where: { id } });
        if (!reason) return false;
        
        await reasonRepo.delete(id);
        return true;
      },
      // Fallback to original implementation
      () => settingsDb.deleteReason(id),
      'delete-reason'
    );

    if (!result) {
      res.status(404).json({ error: 'Reason not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reason:', error);
    res.status(500).json({ error: 'Failed to delete reason' });
  }
}) as RequestHandler<IdParams>);

// GET /reasons/grouped - Get reasons grouped by category (TypeORM-enhanced feature)
router.get('/reasons/grouped', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation with enhanced grouping
      async () => {
        const reasonRepo = getReasonRepository();
        return await reasonRepo.getReasonsGroupedByCategory();
      },
      // Fallback to basic grouping
      () => {
        const categories = settingsDb.getAllCategories();
        const reasons = settingsDb.getAllReasons();
        
        return categories.reduce((acc, category) => {
          acc[category.name] = reasons.filter(reason => 
            reason.categoryId === category.id
          );
          return acc;
        }, {} as Record<string, ReturnReason[]>);
      },
      'get-reasons-grouped'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching grouped reasons:', error);
    res.status(500).json({ error: 'Failed to fetch grouped reasons' });
  }
}) as RequestHandler);

// Health check endpoint
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const reasonRepo = getReasonRepository();
        const categoryRepo = getReasonCategoryRepositoryTypeORM();
        const categoriesCount = await categoryRepo.count();
        const reasonsCount = await reasonRepo.count();
        
        return {
          status: 'healthy',
          implementation: 'typeorm',
          categoriesCount,
          reasonsCount,
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      () => {
        const categories = settingsDb.getAllCategories();
        const reasons = settingsDb.getAllReasons();
        
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          categoriesCount: categories.length,
          reasonsCount: reasons.length,
          timestamp: new Date().toISOString()
        };
      },
      'reasons-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in reasons health check:', error);
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