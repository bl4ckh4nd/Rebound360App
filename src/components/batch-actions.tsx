import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import { Clipboard, Package, Truck, AlertCircle, Filter, Clock, CreditCard, ArrowRight, CheckCircle, Trash2 } from 'lucide-react'
import type { ReturnItem, ReturnStatus, StatusWorkflow, StatusStep, FollowUpAction } from '../shared/types'
import { useDeleteReturn } from '../renderer/hooks/useReturns.ts'

interface BatchActionsProps {
  selectedReturns: ReturnItem[]
  onUpdateStatus?: (ids: string[], status: ReturnStatus) => void
}

export function BatchActions({ 
  selectedReturns, 
  onUpdateStatus
}: BatchActionsProps) {
  const [open, setOpen] = useState(false)

  const deleteReturnMutation = useDeleteReturn();

  const handleDeleteSelected = async () => {
    const idsToDelete = selectedReturns.map(ret => ret.id);
    if (idsToDelete.length === 0) return;

    const confirmation = window.confirm(
      `Sind Sie sicher, dass Sie ${idsToDelete.length} Retoure${idsToDelete.length > 1 ? 'n' : ''} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (confirmation) {
      try {
        await Promise.all(idsToDelete.map(id => deleteReturnMutation.mutateAsync(id)));
        console.log('Successfully deleted selected returns');
        setOpen(false);
      } catch (error) {
        console.error('Failed to delete returns:', error);
        alert('Fehler beim Löschen der Retouren.');
      }
    }
  };

  if (selectedReturns.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 group relative hover:border-primary/20"
        >
          <Clipboard className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          <span>Stapelaktionen</span>
          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center ml-1">
            {selectedReturns.length}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="px-1 space-y-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Stapelaktionen
          </SheetTitle>
          <div className="card-dashboard p-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {selectedReturns.length} Retoure{selectedReturns.length !== 1 ? 'n' : ''} ausgewählt
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-1">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleDeleteSelected}
            disabled={selectedReturns.length === 0 || deleteReturnMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            <span>{selectedReturns.length} Retoure{selectedReturns.length !== 1 ? 'n' : ''} löschen</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
