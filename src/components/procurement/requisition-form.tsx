import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSuppliers } from '../../renderer/hooks/useSuppliers';
import type { Requisition, ProcurementType, RequisitionStatus, Supplier } from '../../shared/types';
import { useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useToast } from '../../hooks/use-toast';

const basicInfoSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  department: z.string().min(1, 'Abteilung ist erforderlich'),
  priority: z.enum(['low', 'normal', 'high']),
  neededBy: z.string().optional(),
  budgetCode: z.string().optional(),
  procurementType: z.enum(['material', 'service', 'asset']),
  currency: z.string().min(1, 'Währung ist erforderlich'),
});

const itemSchema = z.object({
  description: z.string().min(1, 'Artikelbeschreibung ist erforderlich'),
  quantity: z.number().min(1, 'Menge muss größer als 0 sein'),
  unitPrice: z.number().min(0, 'Preis muss größer oder gleich 0 sein'),
  unit: z.string().min(1, 'Einheit ist erforderlich'),
  supplierId: z.string().optional(),
  notes: z.string().optional()
});

const itemsSchema = z.object({
  items: z.array(itemSchema).min(1, 'Mindestens ein Artikel ist erforderlich')
});

const requisitionSchema = basicInfoSchema.merge(itemsSchema);

type RequisitionFormData = z.infer<typeof requisitionSchema> & {
  status?: RequisitionStatus;
};

interface RequisitionFormProps {
  initialData?: Requisition;
  onSubmit: (data: RequisitionFormData) => Promise<void>;
  onCancel: () => void;
  requisitionId?: string;
  currentStep?: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
}

export function RequisitionForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  requisitionId,
  currentStep = 1,
  totalSteps = 2,
  onStepChange = () => {}
}: RequisitionFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auto-save functionality
  // NOTE: This currently saves the entire form data with status: 'draft' on every change
  // when editing (requisitionId exists). This might conflict with the explicit workflow actions
  // (e.g., Submit, Approve) if the user makes a change right before clicking another action.
  // Consider if this auto-save is strictly necessary or if manual draft saving is sufficient.
  // If kept, ensure the `onSubmit` in the dialog properly handles the final intended status.
  const debouncedSave = useCallback(
    debounce(async (data: RequisitionFormData) => {
      if (!requisitionId) return; // Only auto-save if editing an existing requisition
      try {
        // Ensure auto-save always sets status to 'draft' regardless of current form state
        await onSubmit({ ...data, status: 'draft' }); 
        // console.log('Auto-saved draft:', data); // Optional console log
        /* Remove toast for auto-save to avoid being too noisy 
        toast({
          title: "Entwurf automatisch gespeichert",
          description: "Änderungen wurden zwischengespeichert.",
        });
        */
      } catch (error) {
        console.error('Error auto-saving draft:', error);
        // Optionally show an error toast for failed auto-save
      }
    }, 3000), // Increased debounce time to 3 seconds
    [requisitionId, onSubmit] // Removed toast from dependencies
  );

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors }, getValues, reset } = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      department: '',
      priority: 'normal',
      currency: 'EUR',
      procurementType: 'material' as ProcurementType,
      items: [{ description: '', quantity: 1, unitPrice: 0, unit: 'Stück', notes: '' }]
    }
  });

  // Watch form changes for auto-save
  const formValues = watch();
  useEffect(() => {
    if (requisitionId) {
      debouncedSave(formValues);
    }
  }, [formValues, debouncedSave, requisitionId]);

  const handleCancel = useCallback(() => {
    onCancel();
    navigate({ to: '/procurement/requisitions' });
  }, [onCancel, navigate]);

  const handleSubmitForm = useCallback(async (data: RequisitionFormData) => {
    await onSubmit({
      ...data,
      status: initialData?.status || 'draft'
    });
  }, [initialData?.status, onSubmit]);

  const { data: suppliers = [] } = useSuppliers({ status: 'active' });
  
  const items = watch('items');
  const totalAmount = useMemo(() => 
    items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0),
    [items]
  );
  
  const addItem = useCallback(() => {
    setValue('items', [...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'Stück',
      notes: ''
    }]);
  }, [items, setValue]);
  
  const removeItem = useCallback((index: number) => {
    setValue('items', items.filter((_, i) => i !== index));
  }, [items, setValue]);

  const goToNextStep = useCallback(async () => {
    if (currentStep === 1) {
      const isValid = await trigger([
        'title', 'description', 'department', 
        'priority', 'procurementType', 'currency'
      ]);
      
      if (isValid) {
        onStepChange(2);
      }
    }
  }, [currentStep, trigger, onStepChange]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, onStepChange]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="department">Abteilung</Label>
              <Input
                id="department"
                {...register('department')}
                className={errors.department ? 'border-red-500' : ''}
              />
              {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priorität</Label>
              <Select 
                defaultValue={getValues('priority') || 'normal'}
                onValueChange={(value) => setValue('priority', value as 'low' | 'normal' | 'high')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>
            <div>
              <Label htmlFor="procurementType">Art der Beschaffung</Label>
              <Select 
                defaultValue={getValues('procurementType')}
                onValueChange={(value) => setValue('procurementType', value as ProcurementType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Beschaffungsart wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="service">Dienstleistung</SelectItem>
                  <SelectItem value="asset">Anlage</SelectItem>
                </SelectContent>
              </Select>
              {errors.procurementType && <p className="text-sm text-red-500">{errors.procurementType.message}</p>}
            </div>
            <div>
              <Label htmlFor="neededBy">Benötigt bis</Label>
              <Input
                id="neededBy"
                type="date"
                {...register('neededBy')}
                className={errors.neededBy ? 'border-red-500' : ''}
              />
              {errors.neededBy && <p className="text-sm text-red-500">{errors.neededBy.message}</p>}
            </div>
            <div>
              <Label htmlFor="budgetCode">Budgetcode</Label>
              <Input
                id="budgetCode"
                {...register('budgetCode')}
                className={errors.budgetCode ? 'border-red-500' : ''}
              />
              {errors.budgetCode && <p className="text-sm text-red-500">{errors.budgetCode.message}</p>}
            </div>
            <div>
              <Label htmlFor="currency">Währung</Label>
              <Select 
                defaultValue={getValues('currency')}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Währung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Artikel</h3>
            <Button type="button" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Artikel hinzufügen
            </Button>
          </div>
          <div className="space-y-4">
            {items.map((_, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Beschreibung</Label>
                    <Input
                      {...register(`items.${index}.description`)}
                      className={errors.items?.[index]?.description ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-sm text-red-500">{errors.items?.[index]?.description?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Menge</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-500">{errors.items?.[index]?.quantity?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Einheit</Label>
                    <Input
                      {...register(`items.${index}.unit`)}
                      className={errors.items?.[index]?.unit ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.unit && (
                      <p className="text-sm text-red-500">{errors.items?.[index]?.unit?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Preis pro Einheit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      className={errors.items?.[index]?.unitPrice ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.unitPrice && (
                      <p className="text-sm text-red-500">{errors.items?.[index]?.unitPrice?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Lieferant (optional)</Label>
                    <Select 
                      defaultValue={getValues(`items.${index}.supplierId`)}
                      onValueChange={(value) => setValue(`items.${index}.supplierId`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Lieferant auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier: Supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Anmerkungen</Label>
                    <Input
                      {...register(`items.${index}.notes`)}
                      className={errors.items?.[index]?.notes ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.notes && (
                      <p className="text-sm text-red-500">{errors.items?.[index]?.notes?.message}</p>
                    )}
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Artikel entfernen
                  </Button>
                )}
              </Card>
            ))}
          </div>
          <div>
            <p className="text-lg font-medium">Gesamtbetrag: {totalAmount.toFixed(2)} €</p>
            {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={goToPrevStep}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          )}
        </div>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          {currentStep < totalSteps ? (
            <Button type="button" onClick={goToNextStep}>
              Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit">
              {requisitionId ? 'Speichern' : 'Erstellen'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}