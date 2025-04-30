import React from 'react'
import { FileText, Save, Euro, Receipt, User } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type { ReturnItem } from '../shared/types'

interface CreditNoteFormProps {
  returnItem: ReturnItem
  onSubmit: (returnId: string, creditData: {
    amount: number
    originalInvoiceNumber: string
    creditorNumber: string
  }) => void
}

export function CreditNoteForm({ returnItem, onSubmit }: CreditNoteFormProps) {
  const [formData, setFormData] = React.useState({
    amount: 0,
    originalInvoiceNumber: returnItem.originalInvoiceNumber || '',
    creditorNumber: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(returnItem.id, formData)
  }

  return (
    <div className="card-dashboard group">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Gutschrift erstellen</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Erstellen Sie eine neue Gutschrift für diese Retoure
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                Originale Rechnungsnummer
                <span className="text-xs text-muted-foreground">Pflichtfeld</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  value={formData.originalInvoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalInvoiceNumber: e.target.value }))}
                  placeholder="z.B. RE-2023-001"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                Kreditorennummer
                <span className="text-xs text-muted-foreground">Pflichtfeld</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  value={formData.creditorNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditorNumber: e.target.value }))}
                  placeholder="z.B. K-12345"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium flex items-center justify-between">
                Gutschriftsbetrag
                <span className="text-xs text-muted-foreground">Pflichtfeld</span>
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="group"
              disabled={!formData.amount || !formData.originalInvoiceNumber || !formData.creditorNumber}
            >
              <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Gutschrift erstellen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}