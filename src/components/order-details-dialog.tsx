import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, parseISO } from 'date-fns'
import { Package, FileText, Calendar, Info, Download, ArrowUpDown, Tag, Users, Truck, RefreshCw, AlertCircle, List } from 'lucide-react'
import type { Order, ReturnItem } from '@/shared/types'
import { OrderToReturnModal } from '@/components/order-to-return-modal'
import { useQuery } from '@tanstack/react-query'

interface OrderDetailsDialogProps {
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

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  const parsed = parseISO(date)
  return format(parsed, 'dd.MM.yyyy')
}

export function OrderDetailsDialog({
  order,
  open,
  onClose,
  onCreateReturn,
}: OrderDetailsDialogProps) {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showReturnModal, setShowReturnModal] = React.useState(false)
  const { 
    data: orderReturns = [],
    isLoading: isLoadingReturns,
    isError: isReturnsError,
    error: returnsError
  } = useQuery({
    queryKey: ['returns', 'byOrder', order?.jtl_id],
    queryFn: async () => {
      if (!order?.jtl_id) return [];
      
      const response = await fetch(`/api/returns?orderId=${order.jtl_id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch returns: ${response.statusText}`);
      }
      const returns: ReturnItem[] = await response.json();
      return returns;
    },
    enabled: open && !!order?.jtl_id,
    staleTime: 5 * 60 * 1000,
  });

  const handleCreateReturn = (returnData: {
    orderId: number
    products: { jtl_id: number, quantity: number, reason: string }[]
    workflow_id?: string
    status?: string
    followUpAction: 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss'
  }) => {
    onCreateReturn(returnData)
    setShowReturnModal(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-border/40">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-md bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              Bestellung {order.orderNumber}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 border-b border-border/40">
              <TabsList className="h-12 -mb-px">
                <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:text-primary">
                  <Info className="w-4 h-4 mr-2" />
                  Übersicht
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:border-primary data-[state=active]:text-primary">
                  <Package className="w-4 h-4 mr-2" />
                  Produkte
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:border-primary data-[state=active]:text-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Dokumente
                </TabsTrigger>
                <TabsTrigger value="returns" className="data-[state=active]:border-primary data-[state=active]:text-primary">
                  <List className="w-4 h-4 mr-2" />
                  Retouren ({isLoadingReturns ? '...' : orderReturns.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-6 min-h-[400px] space-y-6">
                {/* Order Details */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="card-dashboard group">
                    <div className="p-6">
                      <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                        Bestelldetails
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Bestellnummer</span>
                          <span className="font-medium">{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Lieferanten-Referenz</span>
                          <span className="font-medium">{order.supplierReference || 'Nicht angegeben'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}>
                            {getStatusDisplay(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-dashboard group">
                    <div className="p-6">
                      <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                        Lieferant
                        <Users className="h-4 w-4 text-primary" />
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="font-medium">{order.supplierName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Referenz</span>
                          <span className="font-medium">{order.supplierReference || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div className="card-dashboard">
                  <div className="p-6">
                    <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                      Zeitlicher Verlauf
                      <Calendar className="h-4 w-4 text-primary" />
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1.5">Bestelldatum</span>
                        <span className="font-medium">{formatDate(order.orderDate)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1.5">Lieferdatum</span>
                        <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(order.status === 'geliefert' || order.status === 'teilgeliefert') && (
                  <div className="flex justify-end">
                    <Button onClick={() => setShowReturnModal(true)} className="group">
                      <Truck className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                      Retoure erstellen
                    </Button>
                  </div>
                )}
              </TabsContent>
            
              <TabsContent value="products" className="p-6 min-h-[400px] space-y-4">
                <div className="grid gap-4">
                  {order.products.map((product) => (
                    <div key={product.id} className="card-dashboard group">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{product.productName}</h3>
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">Artikelnummer</span>
                            <span className="font-medium">{product.sku || 'Nicht angegeben'}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">Menge</span>
                            <span className="font-medium">{product.quantity}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">Preis</span>
                            <span className="font-medium">{product.price.toFixed(2)} €</span>
                          </div>
                          {product.serialNumber && (
                            <div>
                              <span className="text-sm text-muted-foreground block mb-1">Seriennummer</span>
                              <span className="font-medium">{product.serialNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            
              <TabsContent value="documents" className="p-6 min-h-[400px] space-y-6">
                {order.documents && order.documents.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {order.documents.map((doc) => (
                      <div key={doc.id} className="card-dashboard group cursor-pointer hover:border-primary/20">
                        <div className="p-4 flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.fileName}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadDate)}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card-dashboard p-12 text-center">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Keine Dokumente vorhanden</p>
                        <p className="text-sm text-muted-foreground">
                          Dieser Bestellung wurden noch keine Dokumente hinzugefügt
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="returns" className="p-6 min-h-[400px] space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Verknüpfte Retouren
                </h3>
                {isLoadingReturns && (
                  <div className="flex justify-center items-center py-10">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Lade Retouren...</span>
                  </div>
                )}
                {isReturnsError && (
                  <div className="card-dashboard p-4 bg-destructive/10 border-destructive/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <p className="text-sm font-medium text-destructive-foreground">
                        Fehler beim Laden der Retouren. ({returnsError instanceof Error ? returnsError.message : String(returnsError)})
                      </p>
                    </div>
                  </div>
                )}
                {!isLoadingReturns && !isReturnsError && orderReturns.length === 0 && (
                  <div className="card-dashboard p-12 text-center">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <List className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Keine Retouren gefunden</p>
                      <p className="text-sm text-muted-foreground">
                        Für diese Bestellung wurden noch keine Retouren erfasst.
                      </p>
                    </div>
                  </div>
                )}
                {!isLoadingReturns && !isReturnsError && orderReturns.length > 0 && (
                  <div className="space-y-3">
                    {orderReturns.map((ret: ReturnItem) => (
                      <div key={ret.id} className="card-dashboard group">
                        <div className="p-4 flex items-center gap-4">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">
                              Retoure ID: <span className="text-primary">{ret.id}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Erstellt: {formatDate(ret.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{ret.followUpAction}</p>
                            <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusStyles(ret.status)}`}>
                              {ret.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showReturnModal && (
        <OrderToReturnModal
          order={order}
          open={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onCreateReturn={handleCreateReturn}
        />
      )}
    </>
  )
}

// Helper to format file size
function formatFileSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

// Helper to get status display text
function getStatusDisplay(status: string): string {
  switch (status) {
    case 'bestellt':
      return 'Bestellt';
    case 'geliefert':
      return 'Geliefert';
    case 'teilgeliefert':
      return 'Teilweise geliefert';
    case 'storniert':
      return 'Storniert';
    default:
      return status;
  }
}

// Helper to get status styles
function getStatusStyles(status: string): string {
  switch (status) {
    case 'bestellt':
      return 'bg-primary/15 text-primary-foreground';
    case 'geliefert':
      return 'bg-success/15 text-success-foreground';
    case 'teilgeliefert':
      return 'bg-warning/15 text-warning-foreground';
    case 'storniert':
      return 'bg-destructive/15 text-destructive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}