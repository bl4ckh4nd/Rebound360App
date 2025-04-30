import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { getEncryptionKey, getEncryptionSalt } from '../services/credentials';
import { 
  DatabaseSettings, 
  StatusWorkflow, 
  StatusStep, 
  ReasonCategory, 
  ReturnReason,
  FollowUpAction,
  CustomField,
  CustomFieldType,
  WorkflowType
} from '../../shared/types';
import { defaultProcurementWorkflow } from './procurement-init';
import crypto from 'crypto';

// General settings functions
interface DbResult {
  value: string;
}

interface DbRow {
  id: string;
  name: string;
  follow_up_action: string;
  is_default: number;
  workflow_type: string;
  created_at: string;
  updated_at: string;
}

export function getSetting(key: string): string | null {
  const result = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as DbResult | undefined;
  return result ? result.value : null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(`
    INSERT INTO app_settings (key, value, last_updated)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET
      value = excluded.value,
      last_updated = CURRENT_TIMESTAMP
  `).run(key, value);
}

// Database connection settings
export async function getDatabaseSettings(): Promise<DatabaseSettings | null> {
  const settingsJson = getSetting('database_settings');
  if (!settingsJson) return null;

  try {
    const settings = JSON.parse(settingsJson) as DatabaseSettings;
    
    if (settings.password) {
      try {
        settings.password = await decryptPassword(settings.password);
      } catch (decryptError) {
        console.error('Failed to decrypt database password:', decryptError);
        // Clear invalid credentials to force re-entry
        await setDatabaseSettings({
          ...settings,
          password: '',
          isConnected: false
        });
        return null;
      }
    }
    
    return settings;
  } catch (parseError) {
    console.error('Failed to parse database settings:', parseError);
    return null;
  }
}

export async function setDatabaseSettings(settings: DatabaseSettings): Promise<void> {
  // Encrypt password before storing
  const secureSettings = { ...settings };
  if (secureSettings.password) {
    secureSettings.password = await encryptPassword(secureSettings.password);
  }
  setSetting('database_settings', JSON.stringify(secureSettings));
}

export function testDatabaseConnection(settings: DatabaseSettings): boolean {
  try {
    // In a real implementation, this would try to connect to the database
    // For now, we'll simulate a connection
    // TODO: Implement actual MSSQL connection testing
    
    const isSuccess = true; // Simulate successful connection
    
    // Update connection status
    const updatedSettings = {
      ...settings,
      isConnected: isSuccess,
      lastConnectionTest: new Date().toISOString()
    };
    
    setDatabaseSettings(updatedSettings);
    return isSuccess;
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    // Update connection status
    const updatedSettings = {
      ...settings,
      isConnected: false,
      lastConnectionTest: new Date().toISOString()
    };
    
    setDatabaseSettings(updatedSettings);
    return false;
  }
}

// Simple encryption/decryption functions
async function encryptPassword(password: string): Promise<string> {
  const iv = crypto.randomBytes(16);
  // Get credentials from secure storage
  const key = crypto.scryptSync(
    await getEncryptionKey(), 
    await getEncryptionSalt(), 
    32
  );
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

async function decryptPassword(encryptedData: string): Promise<string> {
  try {
    const [ivHex, encryptedPassword] = encryptedData.split(':');
    
    // Validate IV and encrypted data format
    if (!ivHex || !encryptedPassword || ivHex.length !== 32) {
      throw new Error(`Invalid encrypted data format. IV length: ${ivHex?.length}, Data length: ${encryptedPassword?.length}`);
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(
      await getEncryptionKey(),
      await getEncryptionSalt(),
      32
    );
    
    console.log('[Decrypt] Using IV:', ivHex);
    console.log('[Decrypt] Key derived successfully');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', {
      error: (error as Error).message,
      encryptedData: encryptedData?.substring(0, 50) // Log partial for debugging
    });
    throw new Error('Failed to decrypt password. Please verify encryption credentials.');
  }
}

// Status workflow functions
export function getAllWorkflows(): StatusWorkflow[] {
  const workflowRows = db.prepare(`
    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at 
    FROM status_workflows
  `).all() as DbRow[];
  
  return workflowRows.map(row => {
    // Get steps for this workflow
    const steps = getStepsByWorkflowId(row.id);
    
    return {
      id: row.id,
      name: row.name,
      followUpAction: row.follow_up_action as FollowUpAction,
      isDefault: Boolean(row.is_default),
      workflowType: (row.workflow_type || 'return') as WorkflowType,
      steps: steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });
}

export function getWorkflowById(id: string): StatusWorkflow | null {
  const workflow = db.prepare(`
    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at 
    FROM status_workflows WHERE id = ?
  `).get(id) as any;
  
  if (!workflow) return null;
  
  // Get steps for this workflow
  const steps = getStepsByWorkflowId(workflow.id);
  
  return {
    id: workflow.id,
    name: workflow.name,
    followUpAction: workflow.follow_up_action as FollowUpAction,
    isDefault: Boolean(workflow.is_default),
    workflowType: workflow.workflow_type || 'return',
    steps: steps,
    createdAt: workflow.created_at,
    updatedAt: workflow.updated_at
  };
}

export function getWorkflowByFollowUpAction(action: FollowUpAction): StatusWorkflow | null {
  const workflow = db.prepare(`
    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at 
    FROM status_workflows 
    WHERE follow_up_action = ? AND is_default = 1
  `).get(action) as any;
  
  if (!workflow) return null;
  
  // Get steps for this workflow
  const steps = getStepsByWorkflowId(workflow.id);
  
  return {
    id: workflow.id,
    name: workflow.name,
    followUpAction: workflow.follow_up_action as FollowUpAction,
    isDefault: Boolean(workflow.is_default),
    workflowType: workflow.workflow_type || 'return',
    steps: steps,
    createdAt: workflow.created_at,
    updatedAt: workflow.updated_at
  };
}

export function createWorkflow(workflow: Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO status_workflows (id, name, follow_up_action, is_default, workflow_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, 
    workflow.name, 
    workflow.followUpAction, 
    workflow.isDefault ? 1 : 0,
    workflow.workflowType || 'return',
    now, 
    now
  );
  
  // If this is set as default, unset any other defaults for this follow-up action
  if (workflow.isDefault) {
    db.prepare(`
      UPDATE status_workflows 
      SET is_default = 0, updated_at = ?
      WHERE follow_up_action = ? AND id != ?
    `).run(now, workflow.followUpAction, id);
  }
  
  // Create steps if provided
  if (workflow.steps && workflow.steps.length > 0) {
    workflow.steps.forEach((step: StatusStep) => {
      createStep({
        ...step,
        workflowId: id
      });
    });
  }
  
  return id;
}

export function updateWorkflow(id: string, updates: Partial<StatusWorkflow>): boolean {
  const workflow = getWorkflowById(id);
  if (!workflow) return false;
  
  const now = new Date().toISOString();
  
  // Update workflow properties
  db.prepare(`
    UPDATE status_workflows
    SET name = ?, follow_up_action = ?, is_default = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.name || workflow.name,
    updates.followUpAction || workflow.followUpAction,
    updates.isDefault !== undefined ? (updates.isDefault ? 1 : 0) : (workflow.isDefault ? 1 : 0),
    now,
    id
  );
  
  // If this is set as default, unset any other defaults for this follow-up action
  if (updates.isDefault) {
    db.prepare(`
      UPDATE status_workflows 
      SET is_default = 0, updated_at = ?
      WHERE follow_up_action = ? AND id != ?
    `).run(now, updates.followUpAction || workflow.followUpAction, id);
  }
  
  // If steps are provided, replace all steps
  if (updates.steps) {
    // Delete existing steps
    db.prepare('DELETE FROM status_steps WHERE workflow_id = ?').run(id);
    
    // Create new steps
    updates.steps.forEach((step: StatusStep) => {
      createStep({
        ...step,
        workflowId: id
      });
    });
  }
  
  return true;
}

export function deleteWorkflow(id: string): boolean {
  // First check if this workflow exists
  const workflow = getWorkflowById(id);
  if (!workflow) return false;
  
  // Delete steps first (cascading delete should handle this, but being explicit)
  db.prepare('DELETE FROM status_steps WHERE workflow_id = ?').run(id);
  
  // Then delete workflow
  db.prepare('DELETE FROM status_workflows WHERE id = ?').run(id);
  
  return true;
}

// Status step functions
function getStepsByWorkflowId(workflowId: string): StatusStep[] {
  const stepRows = db.prepare(`
    SELECT id, name, description, color, order_index, required_fields, created_at, updated_at
    FROM status_steps
    WHERE workflow_id = ?
    ORDER BY order_index ASC
  `).all(workflowId) as any[];
  
  return stepRows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    order: row.order_index,
    requiredFields: JSON.parse(row.required_fields || '[]'),
    workflowId: workflowId,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function getStepById(id: string): StatusStep | null {
  const step = db.prepare(`
    SELECT id, name, description, color, order_index, required_fields, workflow_id, created_at, updated_at
    FROM status_steps
    WHERE id = ?
  `).get(id) as any;
  
  if (!step) return null;
  
  return {
    id: step.id,
    name: step.name,
    description: step.description,
    color: step.color,
    order: step.order_index,
    requiredFields: JSON.parse(step.required_fields || '[]'),
    workflowId: step.workflow_id,
    createdAt: step.created_at,
    updatedAt: step.updated_at
  };
}

export function createStep(step: Omit<StatusStep, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO status_steps (id, workflow_id, name, description, color, order_index, required_fields, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    step.workflowId,
    step.name,
    step.description || null,
    step.color,
    step.order,
    JSON.stringify(step.requiredFields || []),
    now,
    now
  );
  
  return id;
}

export function updateStep(id: string, updates: Partial<StatusStep>): boolean {
  const step = getStepById(id);
  if (!step) return false;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE status_steps
    SET name = ?, description = ?, color = ?, order_index = ?, required_fields = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.name || step.name,
    updates.description !== undefined ? updates.description : step.description,
    updates.color || step.color,
    updates.order !== undefined ? updates.order : step.order,
    JSON.stringify(updates.requiredFields || step.requiredFields),
    now,
    id
  );
  
  return true;
}

export function deleteStep(id: string): boolean {
  const step = getStepById(id);
  if (!step) return false;
  
  db.prepare('DELETE FROM status_steps WHERE id = ?').run(id);
  
  return true;
}

// Reason category functions
export function getAllCategories(): ReasonCategory[] {
  const categories = db.prepare(`
    SELECT id, name, description, order_index, created_at, updated_at
    FROM reason_categories
    ORDER BY order_index ASC
  `).all() as any[];
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    order: cat.order_index,
    createdAt: cat.created_at,
    updatedAt: cat.updated_at
  }));
}

export function getCategoryById(id: string): ReasonCategory | null {
  const category = db.prepare(`
    SELECT id, name, description, order_index, created_at, updated_at
    FROM reason_categories
    WHERE id = ?
  `).get(id) as any;
  
  if (!category) return null;
  
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    order: category.order_index,
    createdAt: category.created_at,
    updatedAt: category.updated_at
  };
}

export function createCategory(category: Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO reason_categories (id, name, description, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    category.name,
    category.description || null,
    category.order,
    now,
    now
  );
  
  return id;
}

export function updateCategory(id: string, updates: Partial<ReasonCategory>): boolean {
  const category = getCategoryById(id);
  if (!category) return false;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE reason_categories
    SET name = ?, description = ?, order_index = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.name || category.name,
    updates.description !== undefined ? updates.description : category.description,
    updates.order !== undefined ? updates.order : category.order,
    now,
    id
  );
  
  return true;
}

export function deleteCategory(id: string): boolean {
  // Check if category has reasons
  const reasonCount = db.prepare('SELECT COUNT(*) as count FROM return_reasons WHERE category_id = ?').get(id) as { count: number };
  
  if (reasonCount && reasonCount.count > 0) {
    throw new Error('Cannot delete category that contains reasons');
  }
  
  // Delete the category
  db.prepare('DELETE FROM reason_categories WHERE id = ?').run(id);
  
  return true;
}

// Return reason functions
export function getAllReasons(): ReturnReason[] {
  const reasons = db.prepare(`
    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at
    FROM return_reasons
  `).all() as any[];
  
  return reasons.map(reason => ({
    id: reason.id,
    code: reason.code,
    name: reason.name,
    description: reason.description,
    categoryId: reason.category_id,
    isActive: Boolean(reason.is_active),
    applicableActions: JSON.parse(reason.applicable_actions || '[]'),
    createdAt: reason.created_at,
    updatedAt: reason.updated_at
  }));
}

export function getReasonById(id: string): ReturnReason | null {
  const reason = db.prepare(`
    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at
    FROM return_reasons
    WHERE id = ?
  `).get(id) as any;
  
  if (!reason) return null;
  
  return {
    id: reason.id,
    code: reason.code,
    name: reason.name,
    description: reason.description,
    categoryId: reason.category_id,
    isActive: Boolean(reason.is_active),
    applicableActions: JSON.parse(reason.applicable_actions || '[]'),
    createdAt: reason.created_at,
    updatedAt: reason.updated_at
  };
}

export function getReasonsByAction(action: FollowUpAction): ReturnReason[] {
  const reasons = db.prepare(`
    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at
    FROM return_reasons
    WHERE is_active = 1
  `).all() as any[];
  
  return reasons.filter(reason => {
    const applicableActions = JSON.parse(reason.applicable_actions || '[]');
    return applicableActions.includes(action);
  }).map(reason => ({
    id: reason.id,
    code: reason.code,
    name: reason.name,
    description: reason.description,
    categoryId: reason.category_id,
    isActive: Boolean(reason.is_active),
    applicableActions: JSON.parse(reason.applicable_actions || '[]'),
    createdAt: reason.created_at,
    updatedAt: reason.updated_at
  }));
}

export function createReason(reason: Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO return_reasons (id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    reason.code,
    reason.name,
    reason.description || null,
    reason.categoryId,
    reason.isActive ? 1 : 0,
    JSON.stringify(reason.applicableActions || []),
    now,
    now
  );
  
  return id;
}

export function updateReason(id: string, updates: Partial<ReturnReason>): boolean {
  const reason = getReasonById(id);
  if (!reason) return false;
  
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE return_reasons
    SET code = ?, name = ?, description = ?, category_id = ?, is_active = ?, applicable_actions = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.code || reason.code,
    updates.name || reason.name,
    updates.description !== undefined ? updates.description : reason.description,
    updates.categoryId || reason.categoryId,
    updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (reason.isActive ? 1 : 0),
    JSON.stringify(updates.applicableActions || reason.applicableActions),
    now,
    id
  );
  
  return true;
}

export function deleteReason(id: string): boolean {
  const reason = getReasonById(id);
  if (!reason) return false;
  
  db.prepare('DELETE FROM return_reasons WHERE id = ?').run(id);
  
  return true;
}

// Custom fields functions
export function getAllCustomFields(): CustomField[] {
  const fields = db.prepare(`
    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at
    FROM custom_fields
    ORDER BY label ASC
  `).all() as any[];
  
  return fields.map(field => ({
    id: field.id,
    key: field.key,
    label: field.label,
    description: field.description,
    type: field.type as CustomFieldType,
    required: Boolean(field.required),
    defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
    options: field.options ? JSON.parse(field.options) : [],
    createdAt: field.created_at,
    updatedAt: field.updated_at
  }));
}

export function getCustomFieldById(id: string): CustomField | null {
  const field = db.prepare(`
    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at
    FROM custom_fields
    WHERE id = ?
  `).get(id) as any;
  
  if (!field) return null;
  
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    description: field.description,
    type: field.type as CustomFieldType,
    required: Boolean(field.required),
    defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
    options: field.options ? JSON.parse(field.options) : [],
    createdAt: field.created_at,
    updatedAt: field.updated_at
  };
}

export function getCustomFieldByKey(key: string): CustomField | null {
  const field = db.prepare(`
    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at
    FROM custom_fields
    WHERE key = ?
  `).get(key) as any;
  
  if (!field) return null;
  
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    description: field.description,
    type: field.type as CustomFieldType,
    required: Boolean(field.required),
    defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
    options: field.options ? JSON.parse(field.options) : [],
    createdAt: field.created_at,
    updatedAt: field.updated_at
  };
}

export function createCustomField(field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // Check if key already exists
  const existingField = getCustomFieldByKey(field.key);
  if (existingField) {
    throw new Error(`Custom field with key '${field.key}' already exists`);
  }
  
  const defaultValueStr = field.defaultValue !== undefined ? 
    JSON.stringify(field.defaultValue) : null;
  
  const optionsStr = field.options && field.options.length > 0 ? 
    JSON.stringify(field.options) : null;
  
  db.prepare(`
    INSERT INTO custom_fields (id, key, label, description, type, required, default_value, options, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    field.key,
    field.label,
    field.description || null,
    field.type,
    field.required ? 1 : 0,
    defaultValueStr,
    optionsStr,
    now,
    now
  );
  
  return id;
}

export function updateCustomField(id: string, updates: Partial<CustomField>): boolean {
  const field = getCustomFieldById(id);
  if (!field) return false;
  
  const now = new Date().toISOString();
  
  // Check if key is being changed and if new key already exists
  if (updates.key && updates.key !== field.key) {
    const existingField = getCustomFieldByKey(updates.key);
    if (existingField) {
      throw new Error(`Custom field with key '${updates.key}' already exists`);
    }
  }
  
  const defaultValueStr = updates.defaultValue !== undefined ? 
    JSON.stringify(updates.defaultValue) : 
    (field.defaultValue !== null ? JSON.stringify(field.defaultValue) : null);
  
  const optionsStr = updates.options !== undefined ? 
    (updates.options.length > 0 ? JSON.stringify(updates.options) : null) : 
    (field.options && field.options.length > 0 ? JSON.stringify(field.options) : null);
  
  db.prepare(`
    UPDATE custom_fields
    SET key = ?, label = ?, description = ?, type = ?, required = ?, default_value = ?, options = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.key || field.key,
    updates.label || field.label,
    updates.description !== undefined ? updates.description : field.description,
    updates.type || field.type,
    updates.required !== undefined ? (updates.required ? 1 : 0) : (field.required ? 1 : 0),
    defaultValueStr,
    optionsStr,
    now,
    id
  );
  
  return true;
}

export function deleteCustomField(id: string): boolean {
  const field = getCustomFieldById(id);
  if (!field) return false;
  
  // Check if this field is used in any workflow steps
  const steps = getAllWorkflows().flatMap(w => w.steps);
  const isFieldUsed = steps.some(step => step.requiredFields.includes(field.key));
  
  if (isFieldUsed) {
    throw new Error(`Cannot delete custom field '${field.key}' because it is used in workflow steps`);
  }
  
  db.prepare('DELETE FROM custom_fields WHERE id = ?').run(id);
  
  return true;
}

// Initialize default settings data
export function initializeDefaultSettings(): void {
  console.log('Starting to initialize default settings...');

  // Create default database settings if not exist
  if (!getSetting('database_settings')) {
    console.log('Creating default database settings...');
    const defaultDbSettings: DatabaseSettings = {
      host: 'localhost',
      port: 1433,
      database: 'JTL-Wawi',
      username: 'username',
      password: 'password',
      useSSL: false,
      connectionTimeout: 30000,
      isConnected: false,
      lastConnectionTest: new Date().toISOString()
    };
    
    setDatabaseSettings(defaultDbSettings);
    console.log('Default database settings created');
  }
  
  // Create default workflows for each follow-up action if they don't exist
  const followUpActions: FollowUpAction[] = ['gutschrift', 'ersatz', 'reparatur', 'ausschuss', 'procurement'];
  
  console.log('Checking and creating default workflows...');
  followUpActions.forEach(action => {
    const existingWorkflow = getWorkflowByFollowUpAction(action);
    if (!existingWorkflow) {
      console.log(`Creating default workflow for ${action}...`);
      if (action === 'procurement') {
        createWorkflow(defaultProcurementWorkflow);
      } else {
        createDefaultWorkflow(action);
      }
      console.log(`Default workflow for ${action} created`);
    }
  });
  
  // Create default reason categories if none exist
  console.log('Checking and creating default reason categories...');
  const categories = getAllCategories();
  if (categories.length === 0) {
    console.log('Creating default reason categories...');
    createDefaultReasonCategories();
    console.log('Default reason categories created');
  }

  // Create custom_fields table if it doesn't exist
  console.log('Ensuring custom_fields table exists...');
  db.prepare(`
    CREATE TABLE IF NOT EXISTS custom_fields (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      required INTEGER DEFAULT 0,
      default_value TEXT,
      options TEXT,
      entity_type TEXT DEFAULT 'return',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  
  // Create default custom fields if none exist
  console.log('Checking and creating default custom fields...');
  const customFields = getAllCustomFields();
  if (customFields.length === 0) {
    console.log('Creating default custom fields...');
    createDefaultCustomFields();
    console.log('Default custom fields created');
  }

  // Add workflow_type column to status_workflows if it doesn't exist
  try {
    db.prepare("SELECT workflow_type FROM status_workflows LIMIT 1").get();
  } catch (error) {
    console.log('Adding workflow_type column to status_workflows...');
    // Column doesn't exist, add it
    db.prepare(`
      ALTER TABLE status_workflows 
      ADD COLUMN workflow_type TEXT DEFAULT 'return'
    `).run();

    // Update existing workflows to have the return type
    db.prepare(`
      UPDATE status_workflows 
      SET workflow_type = 'return' 
      WHERE workflow_type IS NULL
    `).run();
    console.log('Workflow_type column added and updated');
  }

  console.log('Default settings initialization completed');
}

const defaultGutschriftWorkflow = {
  name: 'Standard-Gutschrift',
  followUpAction: 'gutschrift' as FollowUpAction,
  workflowType: 'return' as const,
  isDefault: true,
  steps: [
    {
      id: uuidv4(),
      name: 'Ausstehend',
      description: 'Retoure wurde erfasst',
      color: '#FFCC00',
      order: 0,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Beauftragt',
      description: 'Retoure wurde genehmigt',
      color: '#33CCFF',
      order: 1,
      requiredFields: ['commissioningDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Versandt',
      description: 'Retoure wurde versandt',
      color: '#FF9900',
      order: 2,
      requiredFields: ['shippingDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Gutgeschrieben',
      description: 'Gutschrift wurde erstellt',
      color: '#99CC00',
      order: 3,
      requiredFields: ['creditNoteNumber', 'creditAmount', 'creditDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Abgeschlossen',
      description: 'Vorgang abgeschlossen',
      color: '#00CC00',
      order: 4,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    }
  ]
};

const defaultErsatzWorkflow = {
  name: 'Standard-Ersatzlieferung',
  followUpAction: 'ersatz' as FollowUpAction,
  workflowType: 'return' as const,
  isDefault: true,
  steps: [
    {
      id: uuidv4(),
      name: 'Ausstehend',
      description: 'Retoure wurde erfasst',
      color: '#FFCC00',
      order: 0,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Beauftragt',
      description: 'Ersatz wurde genehmigt',
      color: '#33CCFF',
      order: 1,
      requiredFields: ['commissioningDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Versandt',
      description: 'Retoure wurde versandt',
      color: '#FF9900',
      order: 2,
      requiredFields: ['shippingDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Abgeschlossen',
      description: 'Ersatzlieferung abgeschlossen',
      color: '#00CC00',
      order: 3,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    }
  ]
};

const defaultReparaturWorkflow = {
  name: 'Standard-Reparatur',
  followUpAction: 'reparatur' as FollowUpAction,
  workflowType: 'return' as const,
  isDefault: true,
  steps: [
    {
      id: uuidv4(),
      name: 'Ausstehend',
      description: 'Reparatur wurde erfasst',
      color: '#FFCC00',
      order: 0,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Beauftragt',
      description: 'Reparatur wurde genehmigt',
      color: '#33CCFF',
      order: 1,
      requiredFields: ['commissioningDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Versandt',
      description: 'Gerät wurde versandt',
      color: '#FF9900',
      order: 2,
      requiredFields: ['shippingDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Abgeschlossen',
      description: 'Reparatur abgeschlossen',
      color: '#00CC00',
      order: 3,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    }
  ]
};

const defaultAusschussWorkflow = {
  name: 'Standard-Ausschuss',
  followUpAction: 'ausschuss' as FollowUpAction,
  workflowType: 'return' as const,
  isDefault: true,
  steps: [
    {
      id: uuidv4(),
      name: 'Ausstehend',
      description: 'Ausschuss wurde erfasst',
      color: '#FFCC00',
      order: 0,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Beauftragt',
      description: 'Ausschuss wurde genehmigt',
      color: '#33CCFF',
      order: 1,
      requiredFields: ['commissioningDate'],
      workflowId: '' // Will be set by createWorkflow
    },
    {
      id: uuidv4(),
      name: 'Abgeschlossen',
      description: 'Ausschuss abgeschlossen',
      color: '#00CC00',
      order: 2,
      requiredFields: [],
      workflowId: '' // Will be set by createWorkflow
    }
  ]
};

function createDefaultWorkflow(action: FollowUpAction): string {
  let workflowId: string;
  
  switch(action) {
    case 'gutschrift':
      workflowId = createWorkflow(defaultGutschriftWorkflow);
      break;
    
    case 'ersatz':
      workflowId = createWorkflow(defaultErsatzWorkflow);
      break;
    
    case 'reparatur':
      workflowId = createWorkflow(defaultReparaturWorkflow);
      break;
      
    case 'ausschuss':
      workflowId = createWorkflow(defaultAusschussWorkflow);
      break;
      
    default:
      throw new Error(`Unsupported follow-up action: ${action}`);
  }
  
  return workflowId;
}

function createDefaultReasonCategories(): void {
  // Create some default categories
  const qualityCategory = createCategory({
    name: 'Qualitätsprobleme',
    description: 'Mängel in der Produktqualität',
    order: 0
  });
  
  const deliveryCategory = createCategory({
    name: 'Lieferprobleme',
    description: 'Probleme mit der Lieferung',
    order: 1
  });
  
  const technicalCategory = createCategory({
    name: 'Technische Probleme',
    description: 'Technische Mängel oder Defekte',
    order: 2
  });
  
  // Create some default reasons in each category
  createReason({
    code: 'QM-001',
    name: 'Produktionsabweichung',
    description: 'Produkt entspricht nicht den Spezifikationen',
    categoryId: qualityCategory,
    isActive: true,
    applicableActions: ['gutschrift', 'ersatz']
  });
  
  createReason({
    code: 'QM-002',
    name: 'Materialfehler',
    description: 'Fehler im verwendeten Material',
    categoryId: qualityCategory,
    isActive: true,
    applicableActions: ['gutschrift', 'ersatz', 'ausschuss']
  });
  
  createReason({
    code: 'LF-001',
    name: 'Falscher Artikel',
    description: 'Falscher Artikel wurde geliefert',
    categoryId: deliveryCategory,
    isActive: true,
    applicableActions: ['gutschrift', 'ersatz']
  });
  
  createReason({
    code: 'LF-002',
    name: 'Transportschaden',
    description: 'Produkt wurde während des Transports beschädigt',
    categoryId: deliveryCategory,
    isActive: true,
    applicableActions: ['gutschrift', 'ersatz', 'reparatur', 'ausschuss']
  });
  
  createReason({
    code: 'TP-001',
    name: 'Funktionsausfall',
    description: 'Produkt funktioniert nicht wie erwartet',
    categoryId: technicalCategory,
    isActive: true,
    applicableActions: ['gutschrift', 'ersatz', 'reparatur', 'ausschuss']
  });
  
  createReason({
    code: 'TP-002',
    name: 'Softwarefehler',
    description: 'Fehler in der Produktsoftware',
    categoryId: technicalCategory,
    isActive: true,
    applicableActions: ['reparatur']
  });
}

// Function to create default custom fields
function createDefaultCustomFields(): void {
  // Example custom fields that might be useful in a return/RMA system
  
  // Processor field - who is processing the return
  createCustomField({
    key: 'processor',
    label: 'Bearbeiter',
    description: 'Name des zuständigen Bearbeiters',
    type: 'text',
    required: false,
    entityType: 'return'
  });
  
  // Reference number field - for external reference numbers
  createCustomField({
    key: 'reference_number',
    label: 'Referenznummer',
    description: 'Externe Referenznummer des Lieferanten',
    type: 'text',
    required: false,
    entityType: 'return'
  });
  
  // Return reason details field - for additional information
  createCustomField({
    key: 'reason_details',
    label: 'Fehler-Details',
    description: 'Detaillierte Beschreibung des Mangels',
    type: 'text',
    required: false,
    entityType: 'return'
  });
  
  // Return inspection date field
  createCustomField({
    key: 'inspection_date',
    label: 'Prüfdatum',
    description: 'Datum der Warenprüfung',
    type: 'date',
    required: false,
    entityType: 'return'
  });
  
  // Return inspection result field
  createCustomField({
    key: 'inspection_result',
    label: 'Prüfergebnis',
    description: 'Ergebnis der Warenprüfung',
    type: 'select',
    required: false,
    options: ['Bestanden', 'Fehlerhaft', 'Nicht prüfbar'],
    entityType: 'return'
  });

  // Default procurement custom fields
  createCustomField({
    key: 'cost_center',
    label: 'Kostenstelle',
    description: 'Kostenstelle für die Beschaffung',
    type: 'text',
    required: false,
    entityType: 'requisition'
  });

  createCustomField({
    key: 'delivery_notes',
    label: 'Lieferhinweise',
    description: 'Besondere Hinweise für die Lieferung',
    type: 'text',
    required: false,
    entityType: 'requisition'
  });

  createCustomField({
    key: 'approval_notes',
    label: 'Genehmigungshinweise',
    description: 'Hinweise für den Genehmigungsprozess',
    type: 'text',
    required: false,
    entityType: 'requisition'
  });

  createCustomField({
    key: 'preferred_supplier',
    label: 'Bevorzugter Lieferant',
    description: 'ID des bevorzugten Lieferanten',
    type: 'text',
    required: false,
    entityType: 'requisition'
  });
}
