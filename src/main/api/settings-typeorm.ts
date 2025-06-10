import { Router, Request, Response } from 'express';
import { 
  getSettingsRepository,
  getWorkflowRepository,
  getReasonRepository,
  getCustomFieldRepository 
} from '../database/repositories';
import { 
  DatabaseSettings, 
  StatusWorkflow, 
  StatusStep, 
  ReturnReason, 
  ReasonCategory, 
  FollowUpAction, 
  CustomField 
} from '../../shared/types';
import * as settingsDb from '../database/settings'; // For encrypted settings fallback

type RequestHandler<P = any, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

/**
 * Settings API routes using TypeORM repositories
 * Demonstrates gradual migration - some endpoints use TypeORM, others still use better-sqlite3
 */
const router = Router();

// Database settings endpoints (still using encrypted storage)
router.get('/database', (async (req, res) => {
  try {
    const settingsRepo = getSettingsRepository();
    const settings = await settingsRepo.getDatabaseCredentials();
    
    if (!settings) {
      return res.status(404).json({ error: 'Database settings not found' });
    }
    
    // Don't send the password to the client for security reasons
    const secureSettings = { ...settings, password: '********' };
    res.json({ data: secureSettings });
  } catch (error) {
    console.error('Error fetching database settings:', error);
    res.status(500).json({ error: 'Failed to fetch database settings' });
  }
}) as RequestHandler);

// Workflow endpoints using TypeORM
router.get('/workflows', (async (req, res) => {
  try {
    const workflowRepo = getWorkflowRepository();
    const workflows = await workflowRepo.getWorkflowsGroupedByAction();
    res.json({ data: workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
}) as RequestHandler);

router.get('/workflows/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const workflowRepo = getWorkflowRepository();
    const workflow = await workflowRepo.getWorkflowWithSteps(id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({ data: workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
}) as RequestHandler);

router.post('/workflows', (async (req, res) => {
  try {
    const workflowData = req.body;
    const workflowRepo = getWorkflowRepository();
    
    // Validate required fields
    if (!workflowData.name || !workflowData.followUpAction || !workflowData.steps) {
      return res.status(400).json({ error: 'Missing required workflow fields' });
    }
    
    const workflow = await workflowRepo.createWorkflowWithSteps(workflowData);
    res.status(201).json({ data: workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
}) as RequestHandler);

// Reason endpoints using TypeORM
router.get('/reasons', (async (req, res) => {
  try {
    const reasonRepo = getReasonRepository();
    const reasons = await reasonRepo.getReasonsGroupedByCategory();
    res.json({ data: reasons });
  } catch (error) {
    console.error('Error fetching reasons:', error);
    res.status(500).json({ error: 'Failed to fetch reasons' });
  }
}) as RequestHandler);

router.get('/reasons/by-action', (async (req, res) => {
  try {
    const { actions } = req.query;
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({ error: 'Actions parameter must be an array' });
    }
    
    const reasonRepo = getReasonRepository();
    const reasons = await reasonRepo.getReasonsForActions(actions as FollowUpAction[]);
    res.json({ data: reasons });
  } catch (error) {
    console.error('Error fetching reasons by action:', error);
    res.status(500).json({ error: 'Failed to fetch reasons' });
  }
}) as RequestHandler);

// Custom fields endpoints using TypeORM
router.get('/custom-fields', (async (req, res) => {
  try {
    const { entityType = 'return' } = req.query;
    const customFieldRepo = getCustomFieldRepository();
    const fields = await customFieldRepo.getFieldsByEntityType(entityType as string);
    res.json({ data: fields });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
}) as RequestHandler);

router.post('/custom-fields', (async (req, res) => {
  try {
    const field: CustomField = req.body;
    
    if (!field.key || !field.label || !field.type) {
      return res.status(400).json({ error: 'Missing required field properties' });
    }
    
    const customFieldRepo = getCustomFieldRepository();
    const fieldId = await customFieldRepo.createCustomField(field);
    const savedField = await customFieldRepo.getCustomFieldById(fieldId);
    res.status(201).json({ data: savedField });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
}) as RequestHandler);

router.put('/custom-fields/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const customFieldRepo = getCustomFieldRepository();
    await customFieldRepo.update(id, updates);
    
    const updatedField = await customFieldRepo.findById(id);
    res.json({ data: updatedField });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
}) as RequestHandler);

// Validate custom field values
router.post('/custom-fields/validate', (async (req, res) => {
  try {
    const { values, entityType = 'return' } = req.body;
    
    const customFieldRepo = getCustomFieldRepository();
    const validation = await customFieldRepo.validateFieldValues(values, entityType);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    res.json({ data: { valid: true } });
  } catch (error) {
    console.error('Error validating custom fields:', error);
    res.status(500).json({ error: 'Failed to validate custom fields' });
  }
}) as RequestHandler);

// General settings using TypeORM
router.get('/general', (async (req, res) => {
  try {
    const settingsRepo = getSettingsRepository();
    const settings = await settingsRepo.getAllSettings();
    res.json({ data: settings });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({ error: 'Failed to fetch general settings' });
  }
}) as RequestHandler);

router.put('/general/:key', (async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const settingsRepo = getSettingsRepository();
    await settingsRepo.setSetting(key, value);
    res.json({ data: { key, value } });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
}) as RequestHandler);

export default router;