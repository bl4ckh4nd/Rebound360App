import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { CreditCard, Euro } from 'lucide-react'

interface CreditNoteDialogProps {
  onSubmit: (data: {
    amount: number
    originalInvoiceNumber: string
    creditorNumber: string
  }) => void
  trigger: React.ReactNode
}

export function CreditNoteDialog({ onSubmit, trigger }: CreditNoteDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    amount: '',
    originalInvoiceNumber: '',
    creditorNumber: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      amount: parseFloat(formData.amount),
      originalInvoiceNumber: formData.originalInvoiceNumber,
      creditorNumber: formData.creditorNumber,
    })
    setFormData({
      amount: '',
      originalInvoiceNumber: '',
      creditorNumber: '',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-md bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            Gutschrift erstellen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="card-dashboard">
            <div className="p-4 space-y-5">
              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center justify-between">
                  Gutschriftsbetrag
                  <span className="text-xs text-muted-foreground">Pflichtfeld</span>
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center justify-between">
                  Originale Rechnungsnummer
                  <span className="text-xs text-muted-foreground">Pflichtfeld</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.originalInvoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalInvoiceNumber: e.target.value }))}
                  placeholder="z.B. RE-2023-001"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium flex items-center justify-between">
                  Kreditorennummer
                  <span className="text-xs text-muted-foreground">Pflichtfeld</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.creditorNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditorNumber: e.target.value }))}
                  placeholder="z.B. K-12345"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={!formData.amount || !formData.originalInvoiceNumber || !formData.creditorNumber}
              className="min-w-[140px]"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Erstellen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
