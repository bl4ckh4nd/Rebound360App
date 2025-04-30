import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSuppliers } from '../../renderer/hooks/useSuppliers';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { PurchaseOrder, RequisitionItem } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

// Form validation schema
const basicInfoSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  supplierId: z.string().min(1, 'Lieferant ist erforderlich'),
  department: z.string().min(1, 'Abteilung ist erforderlich'),
  currency: z.string().min(1, 'Währung ist erforderlich'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional()
});

const itemSchema = z.object({
  id: z.string(),
  requisitionId: z.string(),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  quantity: z.number().min(1, 'Menge muss mindestens 1 sein'),
  unit: z.string().min(1, 'Einheit ist erforderlich'),
  unitPrice: z.number().min(0, 'Preis muss größer oder gleich 0 sein'),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  catalogItemId: z.string().optional(),
  sku: z.string().optional(),
  notes: z.string().optional(),
  estimatedDelivery: z.string().optional()
});

const itemsSchema = z.object({
  items: z.array(itemSchema).min(1, 'Mindestens ein Artikel ist erforderlich')
});

const purchaseOrderSchema = basicInfoSchema.merge(itemsSchema);

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  initialData?: Partial<PurchaseOrder>;
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>;
  onCancel: () => void;
  currentStep?: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
}

export function PurchaseOrderForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  currentStep = 1,
  totalSteps = 2,
  onStepChange = () => {}
}: PurchaseOrderFormProps) {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors }, getValues } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      department: '',
      currency: 'EUR',
      items: [{
        id: uuidv4(),
        requisitionId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        unit: 'Stück',
        notes: ''
      }]
    }
  });

  const handleSubmitForm = async (data: PurchaseOrderFormData) => {
    await onSubmit(data);
  };

  const { data: suppliers = [] } = useSuppliers({ status: 'active' });
  
  const items = watch('items');
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const addItem = () => {
    setValue('items', [...items, {
      id: uuidv4(),
      requisitionId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'Stück',
      notes: ''
    }]);
  };
  
  const removeItem = (index: number) => {
    setValue('items', items.filter((_, i) => i !== index));
  };

  const goToNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger([
        'title', 'description', 'supplierId', 
        'department', 'currency'
      ]);
      
      if (isValid) {
        onStepChange(2);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      {currentStep === 1 && (
        <div className="space-y-6">
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
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplierId">Lieferant</Label>
                <Select 
                  defaultValue={getValues('supplierId')}
                  onValueChange={(value) => setValue('supplierId', value)}
                >
                  <SelectTrigger id="supplierId" className={errors.supplierId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Lieferant wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId.message}</p>}
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
              <div>
                <Label htmlFor="expectedDeliveryDate">Erwartetes Lieferdatum</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  {...register('expectedDeliveryDate')}
                  className={errors.expectedDeliveryDate ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="currency">Währung</Label>
                <Select 
                  defaultValue={getValues('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger id="currency" className={errors.currency ? 'border-red-500' : ''}>
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
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Artikel</h3>
            <Button type="button" onClick={addItem} variant="outline">
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
                  <div className="lg:col-span-4">
                    <Label>Notizen</Label>
                    <Input
                      {...register(`items.${index}.notes`)}
                      className={errors.items?.[index]?.notes ? 'border-red-500' : ''}
                    />
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          {currentStep < totalSteps ? (
            <Button type="button" onClick={goToNextStep}>
              Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit">
              Bestellung erstellen
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}