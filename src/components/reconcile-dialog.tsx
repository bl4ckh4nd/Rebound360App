import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { LinkIcon, Calendar, FileCheck } from 'lucide-react'

interface ReconcileDialogProps {
  onSubmit: (data: {
    invoiceNumber: string
    date: string
  }) => void
  trigger: React.ReactNode
}

export function ReconcileDialog({ onSubmit, trigger }: ReconcileDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
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
              <LinkIcon className="w-5 h-5 text-primary" />
            </div>
            Gutschrift abstimmen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="card-dashboard">
            <div className="p-4 space-y-5">
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
              disabled={!formData.invoiceNumber || !formData.date}
              className="min-w-[140px]"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Abstimmen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
