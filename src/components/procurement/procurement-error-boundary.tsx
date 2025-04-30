import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'

interface ErrorBoundaryProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ProcurementErrorBoundary({ error, resetErrorBoundary }: ErrorBoundaryProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ein Fehler ist aufgetreten</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/procurement' })}
          >
            Zurück zur Übersicht
          </Button>
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Neu laden
          </Button>
        </div>
      </div>
    </div>
  )
}