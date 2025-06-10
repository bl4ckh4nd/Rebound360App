import { BaseRepository } from './base-repository';
import { AppSetting } from '../entities/settings/AppSetting';
import { StatusWorkflow } from '../entities/workflow/StatusWorkflow';
import { StatusStep } from '../entities/workflow/StatusStep';
import { ReasonCategory } from '../entities/settings/ReasonCategory';
import { ReturnReason } from '../entities/settings/ReturnReason';
import { CustomField } from '../entities/settings/CustomField';
import { getDataSource } from '../typeorm-config';
import { FollowUpAction } from '../entities/types';
import * as crypto from 'crypto';

/**
 * Repository for managing application settings
 * Uses TypeORM for simple operations and better-sqlite3 for encrypted settings
 */
export class SettingsRepository extends BaseRepository<AppSetting> {
  constructor() {
    super(AppSetting);
  }

  /**
   * Get setting value by key
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.findOne({ where: { key } });
    return setting?.value || null;
  }

  /**
   * Set or update a setting
   */
  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.findOne({ where: { key } });
    
    if (existing) {
      await this.update(key, { value });
    } else {
      await this.save({ key, value });
    }
  }

  /**
   * Get database credentials (decrypted)
   * Uses better-sqlite3 for direct access to encrypted data
   */
  async getDatabaseCredentials(): Promise<{
    server: string;
    database: string;
    username: string;
    password: string;
  } | null> {
    // This would integrate with the existing encryption logic
    const result = this.executeRawQuerySingle<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      ['jtl_database']
    );
    
    if (!result) return null;
    
    try {
      return JSON.parse(result.value);
    } catch {
      return null;
    }
  }

  /**
   * Get all settings as key-value pairs
   */
  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.findAll();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }
}

/**
 * Repository for workflow management with complex queries
 */
export class WorkflowRepository extends BaseRepository<StatusWorkflow> {
  constructor() {
    super(StatusWorkflow);
  }

  /**
   * Get workflow with steps using TypeORM relations
   */
  async getWorkflowWithSteps(workflowId: string): Promise<StatusWorkflow | null> {
    return this.findOne({
      where: { id: workflowId },
      relations: ['steps'],
      order: {
        steps: {
          orderIndex: 'ASC'
        }
      }
    });
  }

  /**
   * Get default workflow for follow-up action
   */
  async getDefaultWorkflow(followUpAction: FollowUpAction): Promise<StatusWorkflow | null> {
    return this.findOne({
      where: {
        followUpAction,
        isDefault: true
      },
      relations: ['steps']
    });
  }

  /**
   * Create workflow with steps using TypeORM transaction
   */
  async createWorkflowWithSteps(data: {
    name: string;
    followUpAction: FollowUpAction;
    isDefault?: boolean;
    workflowType?: string;
    steps: Array<{
      name: string;
      description?: string;
      color: string;
      orderIndex: number;
      requiredFields?: string[];
    }>;
  }): Promise<StatusWorkflow> {
    const dataSource = getDataSource();
    
    return dataSource.transaction(async manager => {
      // Create workflow
      const workflow = manager.create(StatusWorkflow, {
        id: crypto.randomUUID(),
        name: data.name,
        followUpAction: data.followUpAction,
        isDefault: data.isDefault || false,
        workflowType: data.workflowType || 'return' as any
      } as any);
      
      const savedWorkflow = await manager.save(workflow);
      
      // Create steps
      if (data.steps && data.steps.length > 0) {
        const steps = data.steps.map(step => 
          manager.create(StatusStep, {
            id: crypto.randomUUID(),
            ...step,
            workflowId: savedWorkflow.id
          })
        );
        await manager.save(steps);
        savedWorkflow.steps = steps;
      }
      
      return savedWorkflow;
    });
  }

  /**
   * Get all workflows grouped by follow-up action
   * Uses raw SQL for efficient grouping
   */
  async getWorkflowsGroupedByAction(): Promise<Record<string, StatusWorkflow[]>> {
    const query = `
      SELECT 
        w.*,
        json_group_array(
          json_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'color', s.color,
            'orderIndex', s.order_index,
            'requiredFields', s.required_fields
          )
        ) as steps
      FROM status_workflows w
      LEFT JOIN status_steps s ON w.id = s.workflow_id
      GROUP BY w.id
      ORDER BY w.follow_up_action, w.name
    `;
    
    const results = this.executeRawQuery<any>(query);
    
    const workflows = results.map((row: any) => ({
      ...row,
      steps: JSON.parse(row.steps)
    }));
    
    // Group by follow-up action
    return workflows.reduce((acc: any, workflow: any) => {
      if (!acc[workflow.follow_up_action]) {
        acc[workflow.follow_up_action] = [];
      }
      acc[workflow.follow_up_action].push(workflow);
      return acc;
    }, {} as Record<string, StatusWorkflow[]>);
  }

  /**
   * Get workflow statistics by follow-up action
   * Public method for accessing raw query functionality
   */
  async getWorkflowStatistics(): Promise<any[]> {
    const query = `
      SELECT 
        w.follow_up_action,
        COUNT(DISTINCT w.id) as workflow_count,
        COUNT(DISTINCT s.id) as step_count,
        AVG(s.order_index) as avg_steps_per_workflow
      FROM status_workflows w
      LEFT JOIN status_steps s ON w.id = s.workflow_id
      GROUP BY w.follow_up_action
      ORDER BY workflow_count DESC
    `;
    
    return this.executeRawQuery(query);
  }

  /**
   * Execute raw query (public wrapper for protected method)
   * Use only for complex queries that TypeORM can't handle
   */
  executeRawQuery<R = any>(query: string, params: any[] = []): R[] {
    return super.executeRawQuery<R>(query, params);
  }

  /**
   * Convert entity to DTO (removes TypeORM relations like 'returns')
   */
  entityToDTO(entity: StatusWorkflow): any {
    return {
      id: entity.id,
      name: entity.name,
      followUpAction: entity.followUpAction,
      isDefault: entity.isDefault,
      workflowType: entity.workflowType,
      steps: entity.steps?.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        color: step.color,
        order: step.orderIndex,  // Map orderIndex to order
        requiredFields: step.requiredFields || [],
        workflowId: step.workflowId
      })) || [],
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  /**
   * Convert entities to DTOs
   */
  entitiesToDTOs(entities: StatusWorkflow[]): any[] {
    return entities.map(entity => this.entityToDTO(entity));
  }
}

/**
 * Repository for reason management
 */
export class ReasonRepository extends BaseRepository<ReturnReason> {
  constructor() {
    super(ReturnReason);
  }

  /**
   * Get reasons by category with TypeORM
   */
  async getReasonsByCategory(categoryId: string): Promise<ReturnReason[]> {
    return this.findAll({
      where: { categoryId, isActive: true },
      relations: ['category']
    });
  }

  /**
   * Get reasons applicable for specific follow-up actions
   * Uses JSON querying for flexible filtering
   */
  async getReasonsForActions(actions: FollowUpAction[]): Promise<ReturnReason[]> {
    const placeholders = actions.map(() => '?').join(',');
    const query = `
      SELECT r.*, c.name as categoryName
      FROM return_reasons r
      LEFT JOIN reason_categories c ON r.category_id = c.id
      WHERE r.is_active = 1
      AND EXISTS (
        SELECT 1 FROM json_each(r.applicable_actions) 
        WHERE json_each.value IN (${placeholders})
      )
      ORDER BY c.order_index, r.name
    `;
    
    const results = this.executeRawQuery(query, actions);
    return results.map(row => ({
      ...row,
      applicableActions: JSON.parse(row.applicable_actions || '[]')
    }));
  }

  /**
   * Get all reasons grouped by category
   */
  async getReasonsGroupedByCategory(): Promise<Record<string, ReturnReason[]>> {
    const query = `
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        c.order_index as categoryOrder,
        json_group_array(
          CASE WHEN r.id IS NOT NULL THEN
            json_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'description', r.description,
              'isActive', r.is_active,
              'applicableActions', r.applicable_actions
            )
          END
        ) FILTER (WHERE r.id IS NOT NULL) as reasons
      FROM reason_categories c
      LEFT JOIN return_reasons r ON c.id = r.category_id
      GROUP BY c.id
      ORDER BY c.order_index
    `;
    
    const results = this.executeRawQuery<any>(query);
    
    return results.reduce((acc, row) => {
      acc[row.categoryName] = JSON.parse(row.reasons).map((reason: any) => ({
        ...reason,
        applicableActions: JSON.parse(reason.applicableActions || '[]')
      }));
      return acc;
    }, {} as Record<string, ReturnReason[]>);
  }
}

/**
 * Repository for custom fields
 */
export class CustomFieldRepository extends BaseRepository<CustomField> {
  constructor() {
    super(CustomField);
  }

  /**
   * Get custom fields by entity type
   */
  async getFieldsByEntityType(entityType: string = 'return'): Promise<CustomField[]> {
    return this.findAll({
      where: { entityType: entityType as any },
      order: { label: 'ASC' }
    });
  }

  /**
   * Get required fields for entity type
   */
  async getRequiredFields(entityType: string = 'return'): Promise<CustomField[]> {
    return this.findAll({
      where: { 
        entityType: entityType as any,
        required: true
      }
    });
  }

  /**
   * Validate field values against definitions
   */
  async validateFieldValues(
    values: Record<string, any>, 
    entityType: string = 'return'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const fields = await this.getFieldsByEntityType(entityType);
    const errors: string[] = [];
    
    for (const field of fields) {
      const value = values[field.key];
      
      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.label} is required`);
        continue;
      }
      
      // Type validation
      if (value !== undefined && value !== null) {
        switch (field.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`${field.label} must be a number`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(`${field.label} must be a valid date`);
            }
            break;
          case 'select':
            const options = field.options || [];
            if (options.length > 0 && !options.includes(value)) {
              errors.push(`${field.label} must be one of: ${options.join(', ')}`);
            }
            break;
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}