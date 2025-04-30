import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Requisition, PurchaseOrder, RequisitionItem } from '../../shared/types';

interface OrderDiffViewProps {
  requisition: Requisition;
  purchaseOrder: PurchaseOrder;
}

interface ItemDifference {
  field: string;
  oldValue: any;
  newValue: any;
}

interface ItemComparison {
  requisitionItem: RequisitionItem;
  purchaseOrderItem: RequisitionItem;
  differences: ItemDifference[];
}

export function OrderDiffView({ requisition, purchaseOrder }: OrderDiffViewProps) {
  // Compare items and find differences
  const itemComparisons: ItemComparison[] = requisition.items.map(reqItem => {
    const poItem = purchaseOrder.items.find(item => item.id === reqItem.id);
    if (!poItem) return null;

    const differences: ItemDifference[] = [];
    
    // Compare quantity
    if (reqItem.quantity !== poItem.quantity) {
      differences.push({
        field: 'quantity',
        oldValue: reqItem.quantity,
        newValue: poItem.quantity
      });
    }
    
    // Compare unit price
    if (reqItem.unitPrice !== poItem.unitPrice) {
      differences.push({
        field: 'unitPrice',
        oldValue: reqItem.unitPrice,
        newValue: poItem.unitPrice
      });
    }
    
    // Compare notes
    if (reqItem.notes !== poItem.notes) {
      differences.push({
        field: 'notes',
        oldValue: reqItem.notes,
        newValue: poItem.notes
      });
    }

    // Compare supplier
    if (reqItem.supplierId !== poItem.supplierId) {
      differences.push({
        field: 'supplierId',
        oldValue: reqItem.supplierName,
        newValue: poItem.supplierName
      });
    }

    return {
      requisitionItem: reqItem,
      purchaseOrderItem: poItem,
      differences
    };
  }).filter(Boolean) as ItemComparison[];

  // Check if there are any differences
  const hasDifferences = itemComparisons.some(comp => comp.differences.length > 0);

  if (!hasDifferences) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          Keine Änderungen zwischen Anforderung und Bestellung
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Änderungen zur ursprünglichen Anforderung</h3>
      
      {itemComparisons.map((comparison, index) => {
        if (comparison.differences.length === 0) return null;
        
        return (
          <Card key={index} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{comparison.requisitionItem.description}</h4>
              <Badge variant="secondary">
                {comparison.differences.length} Änderungen
              </Badge>
            </div>
            
            <div className="space-y-2">
              {comparison.differences.map((diff, diffIndex) => (
                <div key={diffIndex} className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">
                    {getFieldLabel(diff.field)}:
                  </div>
                  <div className="text-muted-foreground">
                    {formatValue(diff.field, diff.oldValue)}
                  </div>
                  <div className="text-green-600">
                    {formatValue(diff.field, diff.newValue)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function getFieldLabel(field: string): string {
  switch (field) {
    case 'quantity':
      return 'Menge';
    case 'unitPrice':
      return 'Stückpreis';
    case 'notes':
      return 'Anmerkungen';
    case 'supplierId':
      return 'Lieferant';
    default:
      return field;
  }
}

function formatValue(field: string, value: any): string {
  if (value === undefined || value === null) return '-';
  
  switch (field) {
    case 'unitPrice':
      return `${Number(value).toFixed(2)} €`;
    case 'quantity':
      return value.toString();
    default:
      return value;
  }
}