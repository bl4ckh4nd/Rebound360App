import { Router, Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import * as sql from 'mssql';
import * as settingsDb from '../database/settings';
import { DatabaseSettings, StatusWorkflow, StatusStep, ReturnReason, ReasonCategory, FollowUpAction, CustomField } from '../../shared/types';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface EmptyParams extends ParamsDictionary {}
interface IdParams extends ParamsDictionary { id: string }
interface ActionParams extends ParamsDictionary { action: string }

const router = Router();

// Database settings endpoints
router.get('/database', (async (req, res) => {
  try {
    const settings = await settingsDb.getDatabaseSettings();
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

router.post('/database', (async (req, res) => {
  try {
    const settings: DatabaseSettings = req.body;
    
    if (!settings.host || !settings.port || !settings.database || !settings.username) {
      return res.status(400).json({ error: 'Missing required database settings' });
    }
    
    // Get existing settings to preserve password if not provided
    const existingSettings = await settingsDb.getDatabaseSettings();
    if (existingSettings && !settings.password) {
      settings.password = existingSettings.password;
    }
    
    settingsDb.setDatabaseSettings(settings);
    
    // Don't send the password to the client for security reasons
    const secureSettings = { ...settings, password: '********' };
    
    res.json({ data: secureSettings });
  } catch (error) {
    console.error('Error updating database settings:', error);
    res.status(500).json({ error: 'Failed to update database settings' });
  }
}) as RequestHandler<EmptyParams, any, DatabaseSettings>);

router.post('/database/test', (async (req, res) => {
  const settings: DatabaseSettings = req.body;
  const lastConnectionTest = new Date().toISOString();
  console.log('[API /database/test] Received settings:', { ...settings, password: '****' }); // Log received settings (hide pw)

  // Validate required settings
  if (!settings.host || !settings.port || !settings.database || !settings.username /* password can be empty string */) {
    console.log('[API /database/test] Validation failed');
    return res.status(400).json({ 
        success: false, 
        message: 'Fehler: Hostname, Port, Datenbankname und Benutzername sind erforderlich.',
        lastConnectionTest
    });
  }

  const config: sql.config = {
    user: settings.username,
    password: settings.password,
    server: settings.host,
    port: settings.port,
    database: settings.database,
    options: {
      encrypt: settings.useSSL, // Use SSL based on setting
      trustServerCertificate: true // Might be needed for self-signed certs or local dev, adjust if necessary
    },
    connectionTimeout: settings.connectionTimeout || 15000, // Use provided timeout or default
    requestTimeout: settings.connectionTimeout || 15000 // Also apply to requests within the test
  };
  console.log('[API /database/test] Using connection config:', { ...config, password: '****' }); // Log config (hide pw)

  let pool: sql.ConnectionPool | null = null;
  try {
    console.log(`[API /database/test] Attempting DB connection to ${config.server}:${config.port}/${config.database} as ${config.user}`);
    // Create a new connection pool
    pool = new sql.ConnectionPool(config);
    // Attempt to connect
    await pool.connect();
    console.log('[API /database/test] DB Connection successful');

    // If connection succeeds, return success
    const successResponse = { 
      success: true, 
      message: 'Verbindung erfolgreich hergestellt.',
      lastConnectionTest
    };
    console.log('[API /database/test] Sending success response:', successResponse);
    res.json({ 
      success: true, 
      message: 'Verbindung erfolgreich hergestellt.',
      lastConnectionTest
    });

  } catch (err) {
    console.error('[API /database/test] DB Connection failed:', err);
    // If connection fails, return failure with the error message
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    const errorResponse = { 
      success: false, 
      message: `Verbindung fehlgeschlagen: ${errorMessage}`,
      lastConnectionTest
    };
    console.log('[API /database/test] Sending error response (400):', errorResponse);
    // Send 400 Bad Request as the failure is due to potentially bad settings
    res.status(400).json({ 
      success: false, 
      message: `Verbindung fehlgeschlagen: ${errorMessage}`,
      lastConnectionTest
    });

  } finally {
    // Ensure the pool is closed whether connection succeeded or failed
    if (pool) {
      try {
        await pool.close();
        console.log('DB Connection pool closed.');
      } catch (closeErr) {
        console.error('Error closing DB connection pool:', closeErr);
      }
    }
  }
}) as RequestHandler<EmptyParams, any, DatabaseSettings>);

// Status workflow endpoints
router.get('/workflows', (async (req, res) => {
  try {
    const workflows = settingsDb.getAllWorkflows();
    res.json({ data: workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
}) as RequestHandler);

router.get('/workflows/:id', (async (req, res) => {
  try {
    const workflow = settingsDb.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({ data: workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
}) as RequestHandler<IdParams>);

router.get('/workflows/by-action/:action', (async (req, res) => {
  try {
    const workflow = settingsDb.getWorkflowByFollowUpAction(req.params.action as FollowUpAction);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found for this action' });
    }
    
    res.json({ data: workflow });
  } catch (error) {
    console.error('Error fetching workflow by action:', error);
    res.status(500).json({ error: 'Failed to fetch workflow by action' });
  }
}) as RequestHandler<ActionParams>);

router.post('/workflows', (async (req, res) => {
  try {
    const workflow: Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!workflow.name || !workflow.followUpAction) {
      return res.status(400).json({ error: 'Missing required workflow data' });
    }
    
    const id = settingsDb.createWorkflow(workflow);
    const createdWorkflow = settingsDb.getWorkflowById(id);
    
    res.status(201).json({ data: createdWorkflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
}) as RequestHandler<EmptyParams, any, Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'>>);

router.put('/workflows/:id', (async (req, res) => {
  try {
    const updates: Partial<StatusWorkflow> = req.body;
    const isUpdated = settingsDb.updateWorkflow(req.params.id, updates);
    
    if (!isUpdated) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const updatedWorkflow = settingsDb.getWorkflowById(req.params.id);
    
    res.json({ data: updatedWorkflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
}) as RequestHandler<IdParams, any, Partial<StatusWorkflow>>);

router.delete('/workflows/:id', (async (req, res) => {
  try {
    const isDeleted = settingsDb.deleteWorkflow(req.params.id);
    
    if (!isDeleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
}) as RequestHandler<IdParams>);

// Return reason categories endpoints
router.get('/reason-categories', (async (req, res) => {
  try {
    const categories = settingsDb.getAllCategories();
    res.json({ data: categories });
  } catch (error) {
    console.error('Error fetching reason categories:', error);
    res.status(500).json({ error: 'Failed to fetch reason categories' });
  }
}) as RequestHandler);

router.get('/reason-categories/:id', (async (req, res) => {
  try {
    const category = settingsDb.getCategoryById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}) as RequestHandler<IdParams>);

router.post('/reason-categories', (async (req, res) => {
  try {
    const category: Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!category.name) {
      return res.status(400).json({ error: 'Missing required category data' });
    }
    
    const id = settingsDb.createCategory(category);
    const createdCategory = settingsDb.getCategoryById(id);
    
    res.status(201).json({ data: createdCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}) as RequestHandler<EmptyParams, any, Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'>>);

router.put('/reason-categories/:id', (async (req, res) => {
  try {
    const updates: Partial<ReasonCategory> = req.body;
    const isUpdated = settingsDb.updateCategory(req.params.id, updates);
    
    if (!isUpdated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = settingsDb.getCategoryById(req.params.id);
    
    res.json({ data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}) as RequestHandler<IdParams, any, Partial<ReasonCategory>>);

router.delete('/reason-categories/:id', (async (req, res) => {
  try {
    const isDeleted = settingsDb.deleteCategory(req.params.id);
    
    if (!isDeleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}) as RequestHandler<IdParams>);

// Return reasons endpoints
router.get('/reasons', (async (req, res) => {
  try {
    const reasons = settingsDb.getAllReasons();
    res.json({ data: reasons });
  } catch (error) {
    console.error('Error fetching return reasons:', error);
    res.status(500).json({ error: 'Failed to fetch return reasons' });
  }
}) as RequestHandler);

router.get('/reasons/by-action/:action', (async (req, res) => {
  try {
    const reasons = settingsDb.getReasonsByAction(req.params.action as FollowUpAction);
    res.json({ data: reasons });
  } catch (error) {
    console.error('Error fetching reasons by action:', error);
    res.status(500).json({ error: 'Failed to fetch reasons by action' });
  }
}) as RequestHandler<ActionParams>);

router.get('/reasons/:id', (async (req, res) => {
  try {
    const reason = settingsDb.getReasonById(req.params.id);
    
    if (!reason) {
      return res.status(404).json({ error: 'Reason not found' });
    }
    
    res.json({ data: reason });
  } catch (error) {
    console.error('Error fetching reason:', error);
    res.status(500).json({ error: 'Failed to fetch reason' });
  }
}) as RequestHandler<IdParams>);

router.post('/reasons', (async (req, res) => {
  try {
    const reason: Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!reason.name || !reason.categoryId || !reason.code) {
      return res.status(400).json({ error: 'Missing required reason data' });
    }
    
    const id = settingsDb.createReason(reason);
    const createdReason = settingsDb.getReasonById(id);
    
    res.status(201).json({ data: createdReason });
  } catch (error) {
    console.error('Error creating reason:', error);
    res.status(500).json({ error: 'Failed to create reason' });
  }
}) as RequestHandler<EmptyParams, any, Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'>>);

router.put('/reasons/:id', (async (req, res) => {
  try {
    const updates: Partial<ReturnReason> = req.body;
    const isUpdated = settingsDb.updateReason(req.params.id, updates);
    
    if (!isUpdated) {
      return res.status(404).json({ error: 'Reason not found' });
    }
    
    const updatedReason = settingsDb.getReasonById(req.params.id);
    
    res.json({ data: updatedReason });
  } catch (error) {
    console.error('Error updating reason:', error);
    res.status(500).json({ error: 'Failed to update reason' });
  }
}) as RequestHandler<IdParams, any, Partial<ReturnReason>>);

router.delete('/reasons/:id', (async (req, res) => {
  try {
    const isDeleted = settingsDb.deleteReason(req.params.id);
    
    if (!isDeleted) {
      return res.status(404).json({ error: 'Reason not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reason:', error);
    res.status(500).json({ error: 'Failed to delete reason' });
  }
}) as RequestHandler<IdParams>);

// Custom fields endpoints
router.get('/custom-fields', (async (req, res) => {
  try {
    const fields = settingsDb.getAllCustomFields();
    res.json({ data: fields });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
}) as RequestHandler);

router.get('/custom-fields/:id', (async (req, res) => {
  try {
    const field = settingsDb.getCustomFieldById(req.params.id);
    
    if (!field) {
      return res.status(404).json({ error: 'Custom field not found' });
    }
    
    res.json({ data: field });
  } catch (error) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({ error: 'Failed to fetch custom field' });
  }
}) as RequestHandler<IdParams>);

router.post('/custom-fields', (async (req, res) => {
  try {
    const field = req.body;
    
    if (!field.key || !field.label || !field.type) {
      return res.status(400).json({ error: 'Missing required custom field data' });
    }
    
    try {
      const id = settingsDb.createCustomField(field);
      const createdField = settingsDb.getCustomFieldById(id);
      
      res.status(201).json({ data: createdField });
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

router.put('/custom-fields/:id', (async (req, res) => {
  try {
    const updates = req.body;
    
    try {
      const isUpdated = settingsDb.updateCustomField(req.params.id, updates);
      
      if (!isUpdated) {
        return res.status(404).json({ error: 'Custom field not found' });
      }
      
      const updatedField = settingsDb.getCustomFieldById(req.params.id);
      
      res.json({ data: updatedField });
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

router.delete('/custom-fields/:id', (async (req, res) => {
  try {
    try {
      const isDeleted = settingsDb.deleteCustomField(req.params.id);
      
      if (!isDeleted) {
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

// Export the setup function to match main.ts expectation
export function setupSettingsApi() {
  return router;
}

export default router;
