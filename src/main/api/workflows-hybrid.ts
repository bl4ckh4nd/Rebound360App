import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as settingsDb from '../database/settings';
import { getWorkflowRepository } from '../database/repositories';
import { FollowUpAction, StatusWorkflow } from '../../shared/types';
import { useTypeORMForWorkflows, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface IdParams extends ParamsDictionary { id: string }
interface ActionParams extends ParamsDictionary { action: string }

/**
 * Hybrid workflows API that can use TypeORM or fallback to better-sqlite3
 * This demonstrates the migration pattern for gradual rollout
 */
const router = Router();

// GET /workflows - List all workflows
router.get('/', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        // getWorkflowsGroupedByAction already returns plain objects from raw SQL
        return await workflowRepo.getWorkflowsGroupedByAction();
      },
      // Fallback to original implementation
      () => {
        const workflows = settingsDb.getAllWorkflows();
        // Group by follow-up action to match TypeORM implementation
        return workflows.reduce((acc: Record<string, any[]>, workflow) => {
          if (!acc[workflow.followUpAction]) {
            acc[workflow.followUpAction] = [];
          }
          acc[workflow.followUpAction].push(workflow);
          return acc;
        }, {});
      },
      'get-all-workflows'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForWorkflows() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Workflows fetched using ${method}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
}) as RequestHandler);

// GET /workflows/:id - Get specific workflow
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        const workflow = await workflowRepo.getWorkflowWithSteps(id);
        return workflow ? workflowRepo.entityToDTO(workflow) : null;
      },
      // Fallback to original implementation
      () => settingsDb.getWorkflowById(id),
      'get-workflow-by-id'
    );

    if (!result) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
}) as RequestHandler<IdParams>);

// GET /workflows/by-action/:action - Get workflow by follow-up action
router.get('/by-action/:action', (async (req, res) => {
  try {
    const { action } = req.params;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        const workflow = await workflowRepo.getDefaultWorkflow(action as FollowUpAction);
        return workflow ? workflowRepo.entityToDTO(workflow) : null;
      },
      // Fallback to original implementation
      () => settingsDb.getWorkflowByFollowUpAction(action as FollowUpAction),
      'get-workflow-by-action'
    );

    if (!result) {
      return res.status(404).json({ error: 'Workflow not found for this action' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching workflow by action:', error);
    res.status(500).json({ error: 'Failed to fetch workflow by action' });
  }
}) as RequestHandler<ActionParams>);

// POST /workflows - Create new workflow
router.post('/', (async (req, res) => {
  try {
    const workflow: Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!workflow.name || !workflow.followUpAction) {
      return res.status(400).json({ error: 'Missing required workflow data' });
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        const created = await workflowRepo.createWorkflowWithSteps({
          name: workflow.name,
          followUpAction: workflow.followUpAction,
          isDefault: workflow.isDefault,
          workflowType: workflow.workflowType,
          steps: (workflow.steps || []).map(step => ({
            name: step.name,
            description: step.description,
            color: step.color,
            orderIndex: step.order,  // Map order to orderIndex
            requiredFields: step.requiredFields
          }))
        });
        return workflowRepo.entityToDTO(created);
      },
      // Fallback to original implementation
      () => {
        const id = settingsDb.createWorkflow(workflow);
        return settingsDb.getWorkflowById(id);
      },
      'create-workflow'
    );

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
}) as RequestHandler<{}, any, Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /workflows/:id - Update workflow
router.put('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        await workflowRepo.update(id, updates);
        const updated = await workflowRepo.getWorkflowWithSteps(id);
        return updated ? workflowRepo.entityToDTO(updated) : null;
      },
      // Fallback to original implementation
      () => settingsDb.updateWorkflow(id, updates),
      'update-workflow'
    );

    if (!result) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
}) as RequestHandler<IdParams>);

// DELETE /workflows/:id - Delete workflow
router.delete('/:id', (async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const workflowRepo = getWorkflowRepository();
        const workflow = await workflowRepo.findById(id);
        if (!workflow) return null;
        
        await workflowRepo.delete(id);
        return { success: true };
      },
      // Fallback to original implementation
      () => {
        const workflow = settingsDb.getWorkflowById(id);
        if (!workflow) return null;
        
        settingsDb.deleteWorkflow(id);
        return { success: true };
      },
      'delete-workflow'
    );

    if (!result) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
}) as RequestHandler<IdParams>);

// GET /workflows/stats - Get workflow statistics (new TypeORM-only feature)
router.get('/stats', (async (req, res) => {
  try {
    if (!useTypeORMForWorkflows()) {
      return res.status(501).json({ 
        error: 'Workflow statistics require TypeORM to be enabled' 
      });
    }

    const workflowRepo = getWorkflowRepository();
    
    // This is a new feature only available with TypeORM
    const stats = await workflowRepo.getWorkflowStatistics();

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching workflow statistics:', error);
    res.status(500).json({ error: 'Failed to fetch workflow statistics' });
  }
}) as RequestHandler);

export default router;