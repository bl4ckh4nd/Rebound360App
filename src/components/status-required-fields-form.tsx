import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Calendar as CalendarIcon, CreditCard, AlertCircle } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ReturnItem, StatusStep } from '../shared/types'
import { useCustomFields } from '../renderer/hooks/useSettings'
import { CustomFieldInput } from './custom-field-input'

interface StatusRequiredFieldsFormProps {
  returnItem: ReturnItem
  currentStatus: string
  targetStep?: StatusStep
  onSave: (updatedFields: Partial<ReturnItem>) => Promise<void>
}

// Map of system field keys to their display names
export const fieldLabels: Record<string, string> = {
  commissioningDate: 'Beauftragt am',
  shippingDate: 'Versanddatum',
  creditDate: 'Gutschriftsdatum',
  creditNoteNumber: 'Gutschriftsnummer',
  creditAmount: 'Gutschriftsbetrag',
  originalInvoiceNumber: 'Original-Rechnungsnummer',
  reconciliationInvoiceNumber: 'Abstimmbeleg',
  reconciliationDate: 'Abstimmdatum',
  creditorNumber: 'Kreditorennummer'
}

// Component to render individual system field based on field type
const SystemFieldComponent = ({ 
  fieldName, 
  value, 
  onChange,
  error
}: { 
  fieldName: string; 
  value: any; 
  onChange: (value: any) => void;
  error?: string;
}) => {
  // Detect field type based on name and current value
  const isDateField = fieldName.toLowerCase().includes('date');
  const isAmountField = fieldName.toLowerCase().includes('amount');
  const isNumberField = fieldName.toLowerCase().includes('number');
  
  if (isDateField) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm">
          {fieldLabels[fieldName] || fieldName}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-destructive"
              )}
              id={fieldName}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), 'PPP', { locale: de }) : <span>Datum wählen</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : null)}
              initialFocus
              locale={de}
            />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>
    );
  }
  
  if (isAmountField) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm">
          {fieldLabels[fieldName] || fieldName}
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            €
          </span>
          <Input
            id={fieldName}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn("pl-7", error && "border-destructive")}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || null)}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName} className="text-sm">
        {fieldLabels[fieldName] || fieldName}
      </Label>
      <div className="relative">
        {isNumberField && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
          </span>
        )}
        <Input
          id={fieldName}
          type="text"
          className={cn(isNumberField && "pl-9", error && "border-destructive")}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
};

export function StatusRequiredFieldsForm({
  returnItem,
  targetStep,
  onSave
}: StatusRequiredFieldsFormProps) {
  const { data: customFields = [], isLoading: isLoadingCustomFields, error: customFieldsError } = useCustomFields();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with existing values
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    // If no target step provided, nothing to initialize
    if (!targetStep) return;
    
    // Add values for required fields from the returnItem or empty
    targetStep.requiredFields.forEach(field => {
      // Check if this is a system field or a custom field
      if (Object.keys(fieldLabels).includes(field)) {
        // System field
        initialValues[field] = returnItem[field as keyof ReturnItem] || null;
      } else {
        // Custom field - look in the customFields object
        initialValues[field] = returnItem.customFields?.[field] ?? null;
      }
    });
    
    setFormValues(initialValues);
    setErrors({});
  }, [returnItem, targetStep, customFields]);
  
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
    
    // If no target step, nothing to validate
    if (!targetStep) return true;
    
    // Check each required field
    targetStep.requiredFields.forEach(field => {
      const value = formValues[field];
      if (!value) {
        // Get the appropriate label for the field - either system field or custom field
        const customField = customFields.find(cf => cf.key === field);
        const label = customField ? customField.label : (fieldLabels[field] || field);
        
        newErrors[field] = `${label} ist erforderlich`;
        isValid = false;
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
    
    // Separate system fields from custom fields
    const systemFields: Record<string, any> = {};
    const customFieldsValues: Record<string, any> = {};
    
    Object.entries(formValues).forEach(([key, value]) => {
      if (Object.keys(fieldLabels).includes(key)) {
        // System field
        systemFields[key] = value;
      } else {
        // Custom field
        customFieldsValues[key] = value;
      }
    });
    
    // Prepare data for save
    const dataToSave: Partial<ReturnItem> = {
      ...systemFields,
      // Keep any existing custom fields and add/update the new ones
      customFields: {
        ...returnItem.customFields,
        ...customFieldsValues
      }
    };
    
    setIsSaving(true);
    try {
      await onSave(dataToSave);
    } finally {
      setIsSaving(false);
    }
  };
  
  // If there's an error loading custom fields
  if (customFieldsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
        <p className="text-red-700">Fehler beim Laden der benutzerdefinierten Felder</p>
      </div>
    );
  }
  
  // If custom fields are still loading
  if (isLoadingCustomFields) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no target step or no required fields, don't render the form
  if (!targetStep || targetStep.requiredFields.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-center rounded-md">
        <p className="text-muted-foreground">Keine erforderlichen Felder für diesen Status</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {targetStep.requiredFields.map(field => {
            // Check if this is a system field
            if (Object.keys(fieldLabels).includes(field)) {
              return (
                <div key={field} className="mb-4">
                  <SystemFieldComponent
                    fieldName={field}
                    value={formValues[field]}
                    onChange={(value) => handleFieldChange(field, value)}
                    error={errors[field]}
                  />
                </div>
              );
            } else {
              // This is a custom field
              const customField = customFields.find(cf => cf.key === field);
              
              if (customField) {
                return (
                  <div key={field} className="mb-4">
                    <CustomFieldInput
                      field={customField}
                      value={formValues[field]}
                      onChange={(value) => handleFieldChange(field, value)}
                      error={errors[field]}
                    />
                  </div>
                );
              } else {
                // Unknown field
                return (
                  <div key={field} className="p-2 mb-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-700 text-sm">
                      Das Feld "{field}" konnte nicht gefunden werden.
                    </p>
                  </div>
                );
              }
            }
          })}
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Speichern...' : 'Speichern und Status ändern'}
          </Button>
        </div>
      </form>
    </div>
  );
}