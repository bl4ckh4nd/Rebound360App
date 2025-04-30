import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useCreatePurchaseOrder } from '../../renderer/hooks/useProcurement';
import { useToast } from '../../hooks/use-toast';
import type { PurchaseOrder, RequisitionItem } from '../../shared/types';
import { PurchaseOrderForm } from './purchase-order-form';
import type { PurchaseOrderFormData } from './purchase-order-form';

interface PurchaseOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<PurchaseOrder>;
}

export function PurchaseOrderFormDialog({ 
  open, 
  onOpenChange, 
  initialData 
}: PurchaseOrderFormDialogProps) {
  const { toast } = useToast();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    try {
      // Generate order number
      const orderNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      if (!data.title || !data.department) {
        throw new Error('Required fields missing');
      }

      await createPurchaseOrder.mutateAsync({
        title: data.title,
        department: data.department,
        description: data.description || '',
        requesterId: 'system-user',
        requesterName: 'System User',
        orderNumber,
        procurementType: 'material', // Default to material type
        status: 'draft',
        priority: 'normal',
        customFields: {},
        items: data.items,
        billingAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        totalAmount: data.items.reduce((sum: number, item: RequisitionItem) => sum + (item.quantity * item.unitPrice), 0),
        currency: data.currency || 'EUR',
        attachmentIds: []
      });
      
      toast({
        title: "Bestellung erstellt",
        description: "Die Bestellung wurde erfolgreich erstellt.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen der Bestellung ist ein Fehler aufgetreten.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Neue Lagerbestellung</DialogTitle>
        </DialogHeader>
        
        <PurchaseOrderForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          currentStep={step}
          totalSteps={totalSteps}
          onStepChange={setStep}
        />
      </DialogContent>
    </Dialog>
  );
}