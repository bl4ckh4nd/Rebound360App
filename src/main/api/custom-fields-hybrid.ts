import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as settingsDb from '../database/settings';
import { CustomField } from '../../shared/types';
import { withTypeORMFallback, featureFlags } from '../utils/feature-flags';
import { getCustomFieldRepository } from '../database/repository-factory';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface EmptyParams extends ParamsDictionary {}
interface IdParams extends ParamsDictionary { id: string }

const router = Router();

// GET /custom-fields - Get all custom fields
router.get('/', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      async () => {
        const customFieldRepo = getCustomFieldRepository();
        return await customFieldRepo.getAllCustomFields();
      },
      () => settingsDb.getAllCustomFields(),
      'get-all-custom-fields'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
}) as RequestHandler);

// GET /custom-fields/active - Get active custom fields only
router.get('/active', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      async () => {
        const customFieldRepo = getCustomFieldRepository();
        return await customFieldRepo.getActiveCustomFields();
      },
      () => settingsDb.getAllCustomFields().filter(field => field.isActive),
      'get-active-custom-fields'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching active custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch active custom fields' });
  }
}) as RequestHandler);

// GET /custom-fields/usage-stats - Get custom fields with usage statistics
router.get('/usage-stats', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      async () => {
        const customFieldRepo = getCustomFieldRepository();
        return await customFieldRepo.getCustomFieldsWithUsageStats();
      },
      () => {
        // Fallback: just return basic fields without usage stats
        return settingsDb.getAllCustomFields().map(field => ({
          ...field,
          usageCount: 0 // Simplified fallback
        }));
      },
      'get-custom-fields-usage-stats'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching custom fields usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields usage stats' });
  }
}) as RequestHandler);

// GET /custom-fields/:id - Get custom field by ID
router.get('/:id', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      async () => {
        const customFieldRepo = getCustomFieldRepository();
        return await customFieldRepo.getCustomFieldById(req.params.id);
      },
      () => settingsDb.getCustomFieldById(req.params.id),
      'get-custom-field-by-id'
    );

    if (!result) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({ error: 'Failed to fetch custom field' });
  }
}) as RequestHandler<IdParams>);

// POST /custom-fields - Create new custom field
router.post('/', (async (req, res) => {
  try {
    const field = req.body;

    if (!field.key || !field.label || !field.type) {
      return res.status(400).json({ error: 'Missing required custom field data' });
    }

    try {
      const result = await withTypeORMFallback(
        async () => {
          const customFieldRepo = getCustomFieldRepository();
          const id = await customFieldRepo.createCustomField(field);
          return await customFieldRepo.getCustomFieldById(id);
        },
        () => {
          const id = settingsDb.createCustomField(field);
          return settingsDb.getCustomFieldById(id);
        },
        'create-custom-field'
      );

      res.status(201).json({ data: result });
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return res.status(409).json({ error: (error as Error).message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
}) as RequestHandler<EmptyParams, any, Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>>);

// PUT /custom-fields/:id - Update custom field
router.put('/:id', (async (req, res) => {
  try {
    const updates = req.body;

    try {
      const result = await withTypeORMFallback(
        async () => {
          const customFieldRepo = getCustomFieldRepository();
          const isUpdated = await customFieldRepo.updateCustomField(req.params.id, updates);
          
          if (!isUpdated) {
            return null;
          }
          
          return await customFieldRepo.getCustomFieldById(req.params.id);
        },
        () => {
          const isUpdated = settingsDb.updateCustomField(req.params.id, updates);
          
          if (!isUpdated) {
            return null;
          }
          
          return settingsDb.getCustomFieldById(req.params.id);
        },
        'update-custom-field'
      );

      if (!result) {
        return res.status(404).json({ error: 'Custom field not found' });
      }

      res.json({ data: result });
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return res.status(409).json({ error: (error as Error).message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
}) as RequestHandler<IdParams, any, Partial<CustomField>>);

// DELETE /custom-fields/:id - Delete custom field
router.delete('/:id', (async (req, res) => {
  try {
    try {
      const result = await withTypeORMFallback(
        async () => {
          const customFieldRepo = getCustomFieldRepository();
          return await customFieldRepo.deleteCustomField(req.params.id);
        },
        () => settingsDb.deleteCustomField(req.params.id),
        'delete-custom-field'
      );

      if (!result) {
        return res.status(404).json({ error: 'Custom field not found' });
      }

      res.status(204).send();
    } catch (error) {
      if ((error as Error).message.includes('used in workflow steps')) {
        return res.status(409).json({ error: (error as Error).message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
}) as RequestHandler<IdParams>);

export default router;