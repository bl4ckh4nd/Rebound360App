import { BaseRepository } from './base-repository';
import { CustomFieldEntity } from '../entities/custom-field.entity';
import { CustomField } from '../../../shared/types';

export class CustomFieldRepository extends BaseRepository<CustomFieldEntity> {
  constructor() {
    super(CustomFieldEntity);
  }

  /**
   * Get all custom fields ordered by sortOrder
   */
  async getAllCustomFields(): Promise<CustomField[]> {
    const entities = await this.typeormRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });

    return entities.map(this.entityToType);
  }

  /**
   * Get custom field by ID
   */
  async getCustomFieldById(id: string): Promise<CustomField | null> {
    const entity = await this.typeormRepo.findOne({
      where: { id }
    });

    return entity ? this.entityToType(entity) : null;
  }

  /**
   * Get custom field by key
   */
  async getCustomFieldByKey(key: string): Promise<CustomField | null> {
    const entity = await this.typeormRepo.findOne({
      where: { key }
    });

    return entity ? this.entityToType(entity) : null;
  }

  /**
   * Create new custom field
   */
  async createCustomField(field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Check if key already exists
    const existing = await this.getCustomFieldByKey(field.key);
    if (existing) {
      throw new Error(`Custom field with key '${field.key}' already exists`);
    }

    const entity = this.typeormRepo.create({
      key: field.key,
      label: field.label,
      type: field.type as any,  // Type assertion for CustomFieldType compatibility
      description: field.description,
      required: field.required || false,
      defaultValue: field.defaultValue,
      options: field.options,
      placeholder: field.placeholder,
      isActive: field.isActive !== undefined ? field.isActive : true,
      sortOrder: field.sortOrder || 0
    } as any);

    const saved = await this.typeormRepo.save(entity);
    const savedEntity = Array.isArray(saved) ? saved[0] : saved;
    return savedEntity.id;
  }

  /**
   * Update custom field
   */
  async updateCustomField(id: string, updates: Partial<CustomField>): Promise<boolean> {
    // If key is being updated, check for conflicts
    if (updates.key) {
      const existing = await this.getCustomFieldByKey(updates.key);
      if (existing && existing.id !== id) {
        throw new Error(`Custom field with key '${updates.key}' already exists`);
      }
    }

    const updateData: any = {};
    if (updates.key !== undefined) updateData.key = updates.key;
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.required !== undefined) updateData.required = updates.required;
    if (updates.defaultValue !== undefined) updateData.defaultValue = updates.defaultValue;
    if (updates.options !== undefined) updateData.options = updates.options;
    if (updates.placeholder !== undefined) updateData.placeholder = updates.placeholder;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;

    const result = await this.typeormRepo.update(id, updateData);

    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Delete custom field (with validation)
   */
  async deleteCustomField(id: string): Promise<boolean> {
    // Check if field is used in workflow steps (using raw SQL for this check)
    const usageCheck = this.executeRawQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM status_steps 
       WHERE json_extract(requiredFields, '$') LIKE '%"' || ? || '"%'`,
      [id]
    );

    if (usageCheck.length > 0 && usageCheck[0].count > 0) {
      throw new Error('Cannot delete custom field: it is used in workflow steps');
    }

    const result = await this.typeormRepo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get active custom fields only
   */
  async getActiveCustomFields(): Promise<CustomField[]> {
    const entities = await this.typeormRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });

    return entities.map(this.entityToType);
  }

  /**
   * Get custom fields by entity type
   */
  async getFieldsByEntityType(entityType: string = 'return'): Promise<CustomField[]> {
    // Since the CustomFieldEntity doesn't have entityType field, 
    // we'll return all active fields for now
    // TODO: Add entityType field to CustomFieldEntity if needed
    return this.getActiveCustomFields();
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
      if (value !== undefined && value !== null && value !== '') {
        switch (field.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`${field.label} must be a number`);
            }
            break;
          case 'boolean' as any:
            if (typeof value !== 'boolean') {
              errors.push(`${field.label} must be a boolean`);
            }
            break;
          case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value))) {
              errors.push(`${field.label} must be a valid date`);
            }
            break;
          case 'select':
            if (field.options && !field.options.includes(value)) {
              errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
            }
            break;
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Performance-critical operation using raw SQL for complex queries
   */
  async getCustomFieldsWithUsageStats(): Promise<Array<CustomField & { usageCount: number }>> {
    const query = `
      SELECT cf.*,
             COALESCE(usage.count, 0) as usageCount
      FROM custom_fields cf
      LEFT JOIN (
        SELECT json_extract(value, '$.fieldId') as fieldId, COUNT(*) as count
        FROM status_steps,
             json_each(requiredFields)
        WHERE json_extract(value, '$.fieldId') IS NOT NULL
        GROUP BY json_extract(value, '$.fieldId')
      ) usage ON cf.id = usage.fieldId
      ORDER BY cf.sortOrder ASC, cf.createdAt ASC
    `;

    const results = this.executeRawQuery<any>(query);
    
    return results.map(row => ({
      id: row.id,
      key: row.key,
      label: row.label,
      type: row.type,
      description: row.description,
      required: row.required,
      defaultValue: row.defaultValue,
      options: row.options ? JSON.parse(row.options) : null,
      placeholder: row.placeholder,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      usageCount: row.usageCount || 0
    }));
  }

  /**
   * Convert entity to business type
   */
  private entityToType(entity: CustomFieldEntity): CustomField {
    return {
      id: entity.id,
      key: entity.key,
      label: entity.label,
      type: entity.type as any,
      description: entity.description,
      required: entity.required,
      defaultValue: entity.defaultValue,
      options: entity.options,
      placeholder: entity.placeholder,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}