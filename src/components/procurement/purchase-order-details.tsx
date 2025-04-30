import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useParams, useNavigate } from '@tanstack/react-router';
import { usePurchaseOrder, useUpdatePurchaseOrder } from '../../renderer/hooks/useProcurement';
import { Send, ArrowLeft, Check, FileDown } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { generatePurchaseOrderPDF } from '../../lib/pdf-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { OrderDiffView } from './order-diff-view';
import { ApprovalHistory } from './approval-history';

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
}

const STATUS_TRANSITIONS = {
  'draft': {
    next: 'sent',
    label: 'Bestellung senden',
    icon: Send
  },
  'sent': {
    next: 'acknowledged',
    label: 'Als bestätigt markieren',
    icon: Check
  },
  'acknowledged': {
    next: 'completed',
    label: 'Als erhalten markieren',
    icon: Check
  }
};

export function PurchaseOrderDetails() {
  const { orderId } = useParams({ from: '/procurement/purchase-orders/$orderId' });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: order, isLoading } = usePurchaseOrder(orderId);
  const updateOrder = useUpdatePurchaseOrder(orderId);

  const handleStatusTransition = async () => {
    if (!order) return;

    const nextStatus = STATUS_TRANSITIONS[order.status as keyof typeof STATUS_TRANSITIONS]?.next;
    if (!nextStatus) return;

    try {
      await updateOrder.mutateAsync({
        ...order,
        status: nextStatus
      });

      toast({
        title: 'Status aktualisiert',
        description: `Die Bestellung wurde auf "${nextStatus}" gesetzt.`
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Beim Aktualisieren des Status ist ein Fehler aufgetreten.',
        variant: 'destructive'
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!order) return;
    
    try {
      await generatePurchaseOrderPDF(order);
      toast({
        title: 'PDF erstellt',
        description: 'Die Bestellung wurde als PDF exportiert.'
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Beim Erstellen des PDFs ist ein Fehler aufgetreten.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || !order) {
    return <div>Loading...</div>;
  }

  const currentTransition = STATUS_TRANSITIONS[order.status as keyof typeof STATUS_TRANSITIONS];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate({ to: '/procurement/purchase-orders' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold">{order.title}</h1>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={handleGeneratePDF}
          >
            <FileDown className="h-4 w-4 mr-2" />
            PDF exportieren
          </Button>
          
          {currentTransition && (
            <Button onClick={handleStatusTransition}>
              <currentTransition.icon className="h-4 w-4 mr-2" />
              {currentTransition.label}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {order.requisitionId && (
            <>
              <TabsTrigger value="changes">Änderungen</TabsTrigger>
              <TabsTrigger value="approval">Genehmigungsverlauf</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Allgemeine Informationen</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Bestell-Nr.:</span> {order.orderNumber}</p>
                  <p><span className="font-medium">Status:</span> {order.status}</p>
                  <p><span className="font-medium">Abteilung:</span> {order.department}</p>
                  <p><span className="font-medium">Anforderer:</span> {order.requesterName}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Lieferdetails</h3>
                <div className="space-y-1 text-sm">
                  {order.supplierReference && (
                    <p><span className="font-medium">Lieferanten-Ref.:</span> {order.supplierReference}</p>
                  )}
                  <p><span className="font-medium">Gesamtbetrag:</span> {order.totalAmount} {order.currency}</p>
                  {order.expectedDeliveryDate && (
                    <p><span className="font-medium">Erwartete Lieferung:</span> {new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Items */}
          <div>
            <h3 className="font-medium mb-3">Artikel</h3>
            <div className="space-y-2">
              {order.items.map((item: OrderItem) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.description}</h4>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                      )}
                      {item.supplierName && (
                        <p className="text-sm mt-1">Lieferant: {item.supplierName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {(item.quantity * item.unitPrice).toFixed(2)} {order.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} × {item.unitPrice} {order.currency}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Lieferadresse</h3>
              <div className="space-y-1 text-sm">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Rechnungsadresse</h3>
              <div className="space-y-1 text-sm">
                <p>{order.billingAddress.name}</p>
                <p>{order.billingAddress.street}</p>
                <p>{order.billingAddress.zipCode} {order.billingAddress.city}</p>
                <p>{order.billingAddress.country}</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {order.requisitionId && (
          <>
            <TabsContent value="changes" className="mt-6">
              <OrderDiffView requisition={order.requisition} purchaseOrder={order} />
            </TabsContent>

            <TabsContent value="approval" className="mt-6">
              <ApprovalHistory requisitionId={order.requisitionId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}