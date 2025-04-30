import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ShoppingCart, AlertCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import type { Order, OrderProduct } from '../shared/types'
import { useWorkflowByAction } from '../renderer/hooks/useSettings'

interface OrderToReturnModalProps {
  order: Order
  open: boolean
  onClose: () => void
  onCreateReturn: (returnData: {
    orderId: number
    products: { jtl_id: number, quantity: number, reason: string }[]
    workflow_id?: string
    status?: string
    followUpAction: 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss'
  }) => void
}

interface SelectedProduct {
  jtl_id: number
  productName: string
  quantity: number
  maxQuantity: number
  reason: string
}

export function OrderToReturnModal({
  order,
  open,
  onClose,
  onCreateReturn,
}: OrderToReturnModalProps) {
  console.log('[OrderToReturnModal] Received order prop:', order);
  const [selectedProducts, setSelectedProducts] = React.useState<SelectedProduct[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedFollowUpAction, setSelectedFollowUpAction] = React.useState<'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss'>('gutschrift')
  const { data: workflow } = useWorkflowByAction(selectedFollowUpAction)

  React.useEffect(() => {
    if (open) {
      const initialSelectedProducts = order.products.map((product: OrderProduct) => ({
        jtl_id: product.jtl_id,
        productName: product.productName,
        quantity: product.quantity,
        maxQuantity: product.quantity,
        reason: ''
      }))
      setSelectedProducts(initialSelectedProducts)
    } else {
      setSelectedProducts([])
      setSelectedFollowUpAction('gutschrift')
    }
  }, [open, order])

  const handleProductSelection = (productJtlId: number, isSelected: boolean) => {
    if (isSelected) {
      const product = order.products.find(p => p.jtl_id === productJtlId)
      if (product) {
        setSelectedProducts(prev => [
          ...prev,
          {
            jtl_id: product.jtl_id,
            productName: product.productName,
            quantity: product.quantity,
            maxQuantity: product.quantity,
            reason: ''
          }
        ])
      }
    } else {
      setSelectedProducts(prev => prev.filter(p => p.jtl_id !== productJtlId))
    }
  }

  const handleQuantityChange = (productJtlId: number, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.jtl_id === productJtlId
          ? { ...p, quantity: Math.min(Math.max(1, quantity), p.maxQuantity) }
          : p
      )
    )
  }

  const handleReasonChange = (productJtlId: number, reason: string) => {
    setSelectedProducts(prev =>
      prev.map(p => (p.jtl_id === productJtlId ? { ...p, reason } : p))
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const hasEmptyReasons = selectedProducts.some(p => !p.reason.trim())
      if (hasEmptyReasons) {
        alert('Bitte geben Sie für alle ausgewählten Produkte einen Retourengrund an.')
        setIsSubmitting(false)
        return
      }
      
      if (selectedProducts.length === 0) {
        alert('Bitte wählen Sie mindestens ein Produkt für die Retoure aus.')
        setIsSubmitting(false)
        return
      }

      const returnData = {
        orderId: order.jtl_id,
        products: selectedProducts.map(p => ({
          jtl_id: p.jtl_id,
          quantity: p.quantity,
          reason: p.reason
        })),
        workflow_id: workflow?.id,
        status: workflow?.steps?.[0]?.name,
        followUpAction: selectedFollowUpAction,
      }

      onCreateReturn(returnData)
    } catch (error) {
      console.error('Error creating return:', error)
      alert(`Fehler beim Erstellen der Retoure: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isProductSelected = (productJtlId: number) => 
    selectedProducts.some(p => p.jtl_id === productJtlId)

  const getSelectedProduct = (productJtlId: number) => 
    selectedProducts.find(p => p.jtl_id === productJtlId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose()
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Retoure für Bestellung {order.orderNumber} erstellen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bestellnummer</h3>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Lieferant</h3>
              <p className="font-medium">{order.supplierName}</p>
            </div>
          </div>

          <div className="card-dashboard p-4">
            <h3 className="text-sm font-medium mb-2">Art der Retoure (Folgeaktion)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={selectedFollowUpAction === 'gutschrift' ? 'default' : 'outline'}
                onClick={() => setSelectedFollowUpAction('gutschrift')}
                className="w-full"
                size="sm"
              >
                Gutschrift
              </Button>
              <Button
                variant={selectedFollowUpAction === 'ersatz' ? 'default' : 'outline'}
                onClick={() => setSelectedFollowUpAction('ersatz')}
                className="w-full"
                size="sm"
              >
                Ersatz
              </Button>
              <Button
                variant={selectedFollowUpAction === 'reparatur' ? 'default' : 'outline'}
                onClick={() => setSelectedFollowUpAction('reparatur')}
                className="w-full"
                size="sm"
              >
                Reparatur
              </Button>
              <Button
                variant={selectedFollowUpAction === 'ausschuss' ? 'default' : 'outline'}
                onClick={() => setSelectedFollowUpAction('ausschuss')}
                className="w-full"
                size="sm"
              >
                Ausschuss
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Produkte zur Rücksendung auswählen</h3>
            <div className="space-y-3">
              {order.products.map((product) => {
                console.log('[OrderToReturnModal] Mapping product:', product);
                const isSelected = isProductSelected(product.jtl_id)
                const selectedProduct = getSelectedProduct(product.jtl_id)
                
                return (
                  <Card key={product.jtl_id} className={`overflow-hidden transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleProductSelection(product.jtl_id, e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                          />
                          <div>
                            <h4 className="font-medium">{product.productName}</h4>
                            <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap pt-1">
                          Bestellt: {product.quantity}
                        </div>
                      </div>
                      
                      {isSelected && selectedProduct && (
                        <div className="pl-8 space-y-3">
                          <div>
                            <label htmlFor={`quantity-${product.jtl_id}`} className="text-sm font-medium">
                              Menge für Retoure:
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id={`quantity-${product.jtl_id}`}
                                type="number"
                                min={1}
                                max={product.quantity}
                                value={selectedProduct.quantity}
                                onChange={(e) => handleQuantityChange(product.jtl_id, parseInt(e.target.value) || 1)}
                                className="w-24 h-9"
                              />
                              <span className="text-sm text-muted-foreground">
                                von {product.quantity}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor={`reason-${product.jtl_id}`} className="text-sm font-medium">
                              Retourengrund:
                            </label>
                            <Input
                              id={`reason-${product.jtl_id}`}
                              value={selectedProduct.reason}
                              onChange={(e) => handleReasonChange(product.jtl_id, e.target.value)}
                              placeholder="Grund für die Retoure angeben..."
                              className="mt-1 h-9"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Workflow Info */}
          {workflow && (
            <div className="rounded-md bg-primary/5 p-4 flex items-start gap-3 border border-primary/20">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">Workflow: {workflow.name}</p>
                {workflow.steps?.[0]?.name ? (
                   <p className="text-sm text-muted-foreground mt-1">
                    Der initiale Status dieser Retoure wird auf <span className="font-semibold">"{workflow.steps[0].name}"</span> gesetzt.
                   </p>
                ) : (
                   <p className="text-sm text-destructive mt-1">Warnung: Kein initialer Status im Workflow gefunden.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProducts.length === 0 || selectedProducts.some(p => !p.reason.trim())}
          >
            {isSubmitting ? 'Wird erstellt...' : 'Retoure erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
