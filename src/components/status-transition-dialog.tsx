import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
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
import { fieldLabels } from './status-required-fields-form'

interface StatusTransitionDialogProps {
  returnItem: ReturnItem
  currentStep?: StatusStep
  nextStep?: StatusStep
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedFields: Partial<ReturnItem>) => Promise<void>
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
  // Detect field type based on name
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
              weekStartsOn={1} // Monday
              fixedWeeks
              className="rounded-md border" // Removed conflicting grid and cell styles
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
          type={isNumberField ? "text" : "text"}
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

export function StatusTransitionDialog({
  returnItem,
  currentStep,
  nextStep,
  open,
  onOpenChange,
  onSave
}: StatusTransitionDialogProps) {
  const { data: customFields = [], isLoading: isLoadingCustomFields } = useCustomFields();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with existing values
  useEffect(() => {
    if (!open || !nextStep) return;
    
    const initialValues: Record<string, any> = {};
    
    nextStep.requiredFields.forEach(field => {
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
  }, [returnItem, nextStep, open]);
  
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
    if (!nextStep) return true;
    
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    nextStep.requiredFields.forEach(field => {
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
  
  const handleSubmit = async () => {
    console.log('StatusTransitionDialog: Submit triggered', { formValues, nextStep });
    
    if (!validateForm() || !nextStep) {
      console.log('StatusTransitionDialog: Validation failed or no nextStep');
      return;
    }
    
    // Separate system fields from custom fields
    const systemFields: Record<string, any> = {};
    const customFieldsValues: Record<string, any> = {};
    
    Object.entries(formValues).forEach(([key, value]) => {
      if (Object.keys(fieldLabels).includes(key)) {
        systemFields[key] = value;
      } else {
        customFieldsValues[key] = value;
      }
    });
    
    // Prepare data for save - include both field updates and new status
    const dataToSave: Partial<ReturnItem> = {
      ...systemFields,
      status: nextStep.name as ReturnItem['status'],
      customFields: {
        ...returnItem.customFields,
        ...customFieldsValues
      }
    };
    
    console.log('StatusTransitionDialog: Attempting to save', dataToSave);
    
    setIsSaving(true);
    try {
      await onSave(dataToSave);
      console.log('StatusTransitionDialog: Save successful');
      onOpenChange(false);
    } catch (error) {
      console.error('StatusTransitionDialog: Error saving fields:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // If there's no next step or it has no required fields, don't render
  if (!nextStep || !nextStep.requiredFields || nextStep.requiredFields.length === 0) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="status-transition-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep && nextStep && (
              <>Status ändern: {currentStep.name} → {nextStep.name}</>
            )}
          </DialogTitle>
          <DialogDescription id="status-transition-description">
            Bitte füllen Sie die folgenden Felder aus, um zum nächsten Status zu wechseln.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingCustomFields ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }} className="space-y-4 py-4">
            <div className="space-y-4">
              {nextStep.requiredFields.map(field => {
                // Check if this is a system field
                if (Object.keys(fieldLabels).includes(field)) {
                  return (
                    <div key={field}>
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
                      <div key={field}>
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
            
            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Speichern...' : 'Speichern und Status ändern'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
