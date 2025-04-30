import React from 'react'
import { Package, CheckCircle, Clock, CreditCard, Truck, Box, MessageSquare, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import type { ReturnItem, FollowUpAction } from '../shared/types'
import { format } from 'date-fns'
import { useLoaderData } from '@tanstack/react-router'
import { useUpdateReturn, useAddReturnNote } from '../renderer/hooks/useReturns.ts'

export function ReturnsList() {
  const [expandedNotes, setExpandedNotes] = React.useState<string[]>([])
  const [newNotes, setNewNotes] = React.useState<Record<string, string>>({})
  const [creditNoteData, setCreditNoteData] = React.useState<Record<string, {
    amount: number;
    originalInvoiceNumber: string;
    creditorNumber: string;
  }>>({})
  const [reconciliationData, setReconciliationData] = React.useState<Record<string, {
    invoiceNumber: string;
    date: string;
  }>>({})

  // Get route data and mutations
  const { returns = [] } = useLoaderData() as { returns: ReturnItem[] };
  const updateReturnMutation = useUpdateReturn();
  const addNoteMutation = useAddReturnNote();

  const toggleNotes = (returnId: string) => {
    setExpandedNotes(prev =>
      prev.includes(returnId)
        ? prev.filter(id => id !== returnId)
        : [...prev, returnId]
    )
  }

  const handleAddNote = (returnId: string) => {
    const noteContent = newNotes[returnId]?.trim()
    if (noteContent) {
      addNoteMutation.mutateAsync({ 
        id: returnId, 
        content: noteContent,
        author: 'System' // TODO: Get actual user
      });
      setNewNotes(prev => ({ ...prev, [returnId]: '' }))
    }
  }

  const getStatusIcon = (status: ReturnItem['status']) => {
    switch (status) {
      case 'abgeschlossen':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'versandt':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'beauftragt':
        return <Box className="w-5 h-5 text-purple-500" />
      case 'gutgeschrieben':
        return <CreditCard className="w-5 h-5 text-indigo-500" />
      case 'ausstehend':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: ReturnItem['status']) => {
    switch (status) {
      case 'abgeschlossen':
        return 'Abgeschlossen'
      case 'versandt':
        return 'Versandt'
      case 'beauftragt':
        return 'Beauftragt'
      case 'gutgeschrieben':
        return 'Gutgeschrieben'
      case 'ausstehend':
      default:
        return 'Ausstehend'
    }
  }

  const getFollowUpActionBadge = (action: ReturnItem['followUpAction']) => {
    const colors: Record<FollowUpAction, string> = {
      gutschrift: 'bg-green-100 text-green-800',
      ersatz: 'bg-blue-100 text-blue-800',
      reparatur: 'bg-yellow-100 text-yellow-800',
      ausschuss: 'bg-red-100 text-red-800',
      procurement: 'bg-purple-100 text-purple-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[action]}`}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    )
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Return Requests
        </h2>
      </div>
      
      <div className="divide-y">
        {returns.map((item: ReturnItem) => (
          <div key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(item.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">
                      {item.products?.[0]?.productName || 'No product name'}
                    </h3>
                    {getFollowUpActionBadge(item.followUpAction)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.products?.[0]?.quantity || 0} • Order: {item.orderNumber || 'N/A'}
                    {item.supplierReference && ` • Ref: ${item.supplierReference}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.products?.[0]?.reason || 'No reason provided'}
                  </p>
                  {item.creditNoteNumber && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Credit Note: {item.creditNoteNumber}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium">Status: {getStatusText(item.status)}</span>
                    {item.commissioningDate && (
                      <span className="text-sm text-muted-foreground">
                        • Commissioned: {format(new Date(item.commissioningDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    {item.shippingDate && (
                      <span className="text-sm text-muted-foreground">
                        • Shipped: {format(new Date(item.shippingDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {item.status === 'ausstehend' && (
                  <Button
                    variant="outline"
                    onClick={() => updateReturnMutation.mutateAsync({
                      id: item.id,
                      returnData: { status: 'beauftragt' }
                    })}
                  >
                    Beauftragen
                  </Button>
                )}
                {item.status === 'beauftragt' && (
                  <Button
                    variant="outline"
                    onClick={() => updateReturnMutation.mutateAsync({
                      id: item.id,
                      returnData: { status: 'versandt' }
                    })}
                  >
                    Versenden
                  </Button>
                )}
                {item.status === 'versandt' && 
                 item.followUpAction === 'gutschrift' && 
                 !item.creditNoteNumber && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const data = creditNoteData[item.id]
                      if (data?.amount && data.originalInvoiceNumber && data.creditorNumber) {
                        updateReturnMutation.mutateAsync({
                          id: item.id,
                          returnData: {
                            creditNoteNumber: `CN-${Date.now()}`, // Generate a temporary number
                            creditAmount: data.amount,
                            originalInvoiceNumber: data.originalInvoiceNumber,
                            creditorNumber: data.creditorNumber,
                            creditDate: new Date().toISOString(),
                            status: 'gutgeschrieben'
                          }
                        });
                      }
                    }}
                  >
                    Gutschrift erstellen
                  </Button>
                )}
                {item.creditNoteNumber && !item.reconciliationInvoiceNumber && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const data = reconciliationData[item.id]
                      if (data?.invoiceNumber && data.date) {
                        updateReturnMutation.mutateAsync({
                          id: item.id,
                          returnData: {
                            reconciliationInvoiceNumber: data.invoiceNumber,
                            reconciliationDate: data.date,
                            status: 'abgeschlossen'
                          }
                        });
                      }
                    }}
                  >
                    Abstimmen
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => toggleNotes(item.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Notes {item.notes.length > 0 && `(${item.notes.length})`}
                </Button>
              </div>
            </div>

            {expandedNotes.includes(item.id) && (
              <div className="mt-4 pl-9">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-3">Notes & Updates</h4>
                    
                    <div className="space-y-3 mb-4">
                      {item.notes.map((note) => (
                        <div key={note.id} className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm">{note.content}</p>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {note.author} • {format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newNotes[item.id] || ''}
                        onChange={(e) => setNewNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Add a note..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleAddNote(item.id)}
                        disabled={!newNotes[item.id]?.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {item.status === 'versandt' && item.followUpAction === 'gutschrift' && !item.creditNoteNumber && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">Create Credit Note</h4>
                        <div className="space-y-3">
                          <Input
                            type="number"
                            placeholder="Credit Amount"
                            value={creditNoteData[item.id]?.amount || ''}
                            onChange={(e) => setCreditNoteData(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], amount: parseFloat(e.target.value) }
                            }))}
                          />
                          <Input
                            placeholder="Original Invoice Number"
                            value={creditNoteData[item.id]?.originalInvoiceNumber || ''}
                            onChange={(e) => setCreditNoteData(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], originalInvoiceNumber: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Creditor Number"
                            value={creditNoteData[item.id]?.creditorNumber || ''}
                            onChange={(e) => setCreditNoteData(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], creditorNumber: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    {item.creditNoteNumber && !item.reconciliationInvoiceNumber && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">Reconcile Credit Note</h4>
                        <div className="space-y-3">
                          <Input
                            placeholder="Reconciliation Invoice Number"
                            value={reconciliationData[item.id]?.invoiceNumber || ''}
                            onChange={(e) => setReconciliationData(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], invoiceNumber: e.target.value }
                            }))}
                          />
                          <Input
                            type="date"
                            value={reconciliationData[item.id]?.date || ''}
                            onChange={(e) => setReconciliationData(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], date: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}