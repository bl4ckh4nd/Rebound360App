import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { RequisitionForm } from './requisition-form';
import { useCreateRequisition, useUpdateRequisition } from '../../renderer/hooks/useProcurement';
import type { Requisition, RequisitionItem } from '../../shared/types';
import { useToast } from '../../hooks/use-toast';

interface RequisitionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Requisition;
}

export function RequisitionFormDialog({ 
  open, 
  onOpenChange, 
  initialData 
}: RequisitionFormDialogProps) {
  const { toast } = useToast();
  const createRequisition = useCreateRequisition();
  const updateRequisition = useUpdateRequisition();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const handleSubmit = useCallback(async (formData: any) => {
    try {
      const processedData = {
        ...formData,
        requesterId: 'system-user',
        requesterName: 'System',
        requesterEmail: 'system@example.com',
        items: formData.items.map((item: Omit<RequisitionItem, 'id' | 'requisitionId'>) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        comments: [],
        attachmentIds: [],
        totalAmount: formData.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0),
        procurementType: formData.procurementType || 'material'
      };

      if (initialData?.id) {
        await updateRequisition.mutateAsync({
          ...initialData,
          ...processedData,
        });
        toast({
          title: "Anforderung aktualisiert",
          description: "Die Anforderung wurde erfolgreich aktualisiert.",
        });
      } else {
        await createRequisition.mutateAsync(processedData);
        toast({
          title: "Anforderung erstellt",
          description: "Die Anforderung wurde erfolgreich erstellt.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern ist ein Fehler aufgetreten.",
      });
    }
  }, [initialData, createRequisition, updateRequisition, onOpenChange, toast]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Anforderung bearbeiten' : 'Neue Anforderung erstellen'}
            <div className="text-sm font-normal text-gray-500 mt-1">
              Schritt {step} von {totalSteps}
            </div>
          </DialogTitle>
        </DialogHeader>
        <RequisitionForm
          key={initialData?.id || 'new'}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          requisitionId={initialData?.id}
          currentStep={step}
          totalSteps={totalSteps}
          onStepChange={setStep}
        />
      </DialogContent>
    </Dialog>
  );
}