import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast, Toast } from '../../hooks/use-toast';
import { useConvertToPurchaseOrder, useRequisition } from '../../renderer/hooks/useProcurement';
import type { Requisition, RequisitionItem } from '../../shared/types';
import { Loader2, ArrowRight } from 'lucide-react';

interface RequisitionToPODialogProps {
  requisitionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AddressForm {
  name: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
}

interface LocalToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function RequisitionToPODialog({
  requisitionId,
  open,
  onOpenChange
}: RequisitionToPODialogProps) {
  const { data: requisition, isLoading } = useRequisition(requisitionId);
  const convertToPO = useConvertToPurchaseOrder();
  const { toast } = useToast();
  
  const [billingAddress, setBillingAddress] = useState<AddressForm>({
    name: '',
    street: '',
    zipCode: '',
    city: '',
    country: 'DE'
  });
  
  const [shippingAddress, setShippingAddress] = useState<AddressForm>({
    name: '',
    street: '',
    zipCode: '',
    city: '',
    country: 'DE'
  });
  
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  
  const handleSubmit = async () => {
    if (!requisition) return;
    
    try {
      await convertToPO.mutateAsync({
        requisitionId,
        billingAddress: useShippingAsBilling ? shippingAddress : billingAddress,
        shippingAddress
      });
      
      toast({
        title: 'Bestellung erstellt',
        description: 'Die Anforderung wurde erfolgreich in eine Bestellung umgewandelt.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      const toastOptions: LocalToastProps = {
        title: 'Fehler',
        description: error.message || 'Beim Erstellen der Bestellung ist ein Fehler aufgetreten.',
        variant: 'destructive',
      };
      toast(toastOptions as Toast);
    }
  };

  const handleShippingAddressChange = (field: keyof AddressForm, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (useShippingAsBilling) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isLoading || !requisition) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestellung aus Anforderung erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requisition Summary */}
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{requisition.title}</h3>
                <Badge>{requisition.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{requisition.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Abteilung:</span> {requisition.department}
                </div>
                <div>
                  <span className="font-medium">Anforderer:</span> {requisition.requesterName}
                </div>
                <div>
                  <span className="font-medium">Gesamtbetrag:</span> {requisition.totalAmount} {requisition.currency}
                </div>
              </div>
            </div>
          </Card>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className="font-medium">Artikel</h3>
            <div className="space-y-2">
              {requisition.items.map((item: RequisitionItem) => (
                <Card key={item.id} className="p-3">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <div className="font-medium">{item.description}</div>
                      {item.notes && (
                        <div className="text-sm text-muted-foreground">{item.notes}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        à {item.unitPrice} {requisition.currency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(item.quantity * item.unitPrice).toFixed(2)} {requisition.currency}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-medium">Lieferadresse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipping-name">Name</Label>
                <Input
                  id="shipping-name"
                  value={shippingAddress.name}
                  onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shipping-street">Straße</Label>
                <Input
                  id="shipping-street"
                  value={shippingAddress.street}
                  onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shipping-zip">PLZ</Label>
                <Input
                  id="shipping-zip"
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shipping-city">Ort</Label>
                <Input
                  id="shipping-city"
                  value={shippingAddress.city}
                  onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Use shipping address as billing checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-shipping"
              checked={useShippingAsBilling}
              onChange={(e) => setUseShippingAsBilling(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="use-shipping">
              Lieferadresse als Rechnungsadresse verwenden
            </Label>
          </div>

          {/* Billing Address */}
          {!useShippingAsBilling && (
            <div className="space-y-4">
              <h3 className="font-medium">Rechnungsadresse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billing-name">Name</Label>
                  <Input
                    id="billing-name"
                    value={billingAddress.name}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="billing-street">Straße</Label>
                  <Input
                    id="billing-street"
                    value={billingAddress.street}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="billing-zip">PLZ</Label>
                  <Input
                    id="billing-zip"
                    value={billingAddress.zipCode}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="billing-city">Ort</Label>
                  <Input
                    id="billing-city"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={convertToPO.isPending || !shippingAddress.name || !shippingAddress.street || !shippingAddress.zipCode || !shippingAddress.city}
          >
            {convertToPO.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Bestellung erstellen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}