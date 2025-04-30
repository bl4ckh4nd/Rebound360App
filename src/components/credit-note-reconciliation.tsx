import React from 'react'
import { LinkIcon, Check, Calendar, FileCheck, AlertCircle } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type { ReturnItem } from '../shared/types'
import { format } from 'date-fns'

interface CreditNoteReconciliationProps {
  returnItem: ReturnItem
  onReconcile: (returnId: string, reconciliationData: {
    invoiceNumber: string
    date: string
  }) => void
}

export function CreditNoteReconciliation({ returnItem, onReconcile }: CreditNoteReconciliationProps) {
  const [formData, setFormData] = React.useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onReconcile(returnItem.id, formData)
  }

  if (returnItem.reconciliationInvoiceNumber) {
    return (
      <div className="card-dashboard group border-success/20 bg-success/5">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-medium text-success">Abgestimmt</h3>
              <p className="text-sm text-success/80 mt-0.5">
                Abgestimmt mit Rechnung {returnItem.reconciliationInvoiceNumber} am{' '}
                {format(new Date(returnItem.reconciliationDate!), 'dd.MM.yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-dashboard group">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <LinkIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Gutschrift abstimmen</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Stimmen Sie die Gutschrift mit einer Rechnung ab
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">
                Wichtiger Hinweis
              </p>
              <p className="text-sm text-amber-700">
                Die Abstimmung kann nach dem Speichern nicht mehr rückgängig gemacht werden.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                Rechnungsnummer zur Abstimmung
                <span className="text-xs text-muted-foreground">Pflichtfeld</span>
              </label>
              <div className="relative">
                <FileCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="z.B. RE-2023-001"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                Abstimmungsdatum
                <span className="text-xs text-muted-foreground">Pflichtfeld</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="group"
              disabled={!formData.invoiceNumber || !formData.date}
            >
              <Check className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Abstimmen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
