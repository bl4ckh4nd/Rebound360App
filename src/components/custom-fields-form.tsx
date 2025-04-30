import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { CustomFieldInput } from './custom-field-input'
import { ReturnItem, CustomField } from '../shared/types'

interface CustomFieldsFormProps {
  returnItem: ReturnItem
  customFields: CustomField[]
  workflowId?: string // Optional - if provided, only show fields for this workflow
  onSave: (updatedFields: Partial<ReturnItem>) => Promise<void>
}

export function CustomFieldsForm({
  returnItem,
  customFields,
  workflowId,
  onSave
}: CustomFieldsFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [filteredFields, setFilteredFields] = useState<CustomField[]>([]);

  // Initialize form with existing values and filter fields if workflowId is provided
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    let fieldsToShow = [...customFields];

    // If a specific workflow ID is provided, filter fields that are used in this workflow
    if (workflowId) {
      // This would require additional logic to filter based on workflow - for now we show all
    }

    // Sort fields by key for consistent display
    fieldsToShow.sort((a, b) => a.label.localeCompare(b.label));
    
    setFilteredFields(fieldsToShow);
    
    // Initialize with existing values from the returnItem
    fieldsToShow.forEach(field => {
      initialValues[field.key] = returnItem.customFields?.[field.key] ?? null;
    });
    
    setFormValues(initialValues);
    setErrors({});
  }, [customFields, returnItem, workflowId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it was previously set
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Check each required field
    filteredFields.forEach(field => {
      if (field.required) {
        const value = formValues[field.key];
        if (value === null || value === undefined || value === '') {
          newErrors[field.key] = `${field.label} ist erforderlich`;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for save - merge with existing custom fields
    const dataToSave: Partial<ReturnItem> = {
      customFields: {
        ...returnItem.customFields,
        ...formValues
      }
    };
    
    setIsSaving(true);
    try {
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving custom fields:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (filteredFields.length === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-md text-center">
        <p className="text-muted-foreground">Keine benutzerdefinierten Felder verfügbar</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {filteredFields.map(field => (
          <CustomFieldInput
            key={field.key}
            field={field}
            value={formValues[field.key]}
            onChange={(value) => handleFieldChange(field.key, value)}
            error={errors[field.key]}
          />
        ))}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Speichern...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  );
}