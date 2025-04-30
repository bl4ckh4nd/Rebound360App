import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Package, Clock, CreditCard, Truck, Box, CheckCircle, FileText, MessageSquare, Calendar, Plus, AlertCircle, ChevronRight, Tag } from 'lucide-react'
import type { ReturnItem, ReturnStatus, Document, Note, StatusStep, CustomField } from '../shared/types'
import { DocumentViewer } from './document-viewer'
import { DocumentUpload } from './document-upload'
import { CreditNoteDialog } from './credit-note-dialog'
import { ReconcileDialog } from './reconcile-dialog'
import { format, isValid, parseISO } from 'date-fns'
import { useWorkflowByAction, useCustomFields } from '../renderer/hooks/useSettings'
import { fieldLabels } from './status-required-fields-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { CustomFieldsForm } from './custom-fields-form'
import { StatusTransitionDialog } from './status-transition-dialog'

interface ExtendedReturnItem extends ReturnItem {
  updatedAt?: string
  createdAt?: string
}

interface ReturnDetailsDialogProps {
  returnItem: ExtendedReturnItem
  onClose: () => void
  open: boolean
  onAddNote: (returnId: string, note: string) => void
  onCreateCreditNote: (returnId: string, creditData: {
    amount: number
    originalInvoiceNumber: string
    creditorNumber: string
  }) => void
  onReconcileCreditNote: (returnId: string, reconciliationData: {
    invoiceNumber: string
    date: string
  }) => void
  onAddDocument?: (returnId: string, document: Document) => void
  onDeleteDocument?: (documentId: string) => void
  onUpdateReturnFields: (id: string, fields: Partial<ReturnItem>) => Promise<void>
  onUpdateStatus: (ids: string | string[], status: ReturnStatus) => void  // Add this line
  apiUrl?: string
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'dd.MM.yyyy') : 'Ungültiges Datum'
}

const getStatusIcon = (statusName: string, color: string) => {
  return <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />;
};

export function ReturnDetailsDialog({
  returnItem,
  onClose,
  open,
  onAddNote,
  onCreateCreditNote,
  onReconcileCreditNote,
  onAddDocument,
  onDeleteDocument,
  onUpdateReturnFields,
  //onUpdateStatus,
  apiUrl = 'http://localhost:3001'
}: ReturnDetailsDialogProps) {
  const [newNote, setNewNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflowByAction(returnItem.followUpAction)
  const { data: customFields = [], isLoading: isLoadingCustomFields } = useCustomFields()
  const [currentStep, setCurrentStep] = useState<StatusStep | null>(null)
  const [nextStep, setNextStep] = useState<StatusStep | null>(null)
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([])
  const [isStatusTransitionOpen, setIsStatusTransitionOpen] = useState(false)
  const [activeCustomFieldsSheet, setActiveCustomFieldsSheet] = useState(false)
  
  // Find the current step in the workflow based on the return status
  useEffect(() => {
    if (workflow && workflow.steps && workflow.steps.length > 0) {
      console.log("Workflow loaded:", {
        followUpAction: returnItem.followUpAction,
        steps: workflow.steps.map(s => s.name),
        currentStatus: returnItem.status
      });
      
      const matchingStep = workflow.steps.find(step => 
        step.name.toLowerCase() === returnItem.status.toLowerCase()
      )
      
      setCurrentStep(matchingStep || null)
      console.log("Current step:", matchingStep);
      
      // Find the next step in the workflow
      if (matchingStep) {
        const currentIndex = workflow.steps.findIndex(step => step.id === matchingStep.id)
        const nextStepInWorkflow = workflow.steps[currentIndex + 1] || null
        setNextStep(nextStepInWorkflow)
        console.log("Next step:", nextStepInWorkflow);
        
        // Check if all required fields for the next step are available
        if (nextStepInWorkflow) {
          console.log("Checking for missing fields. Required fields:", nextStepInWorkflow.requiredFields);
          console.log("Return item:", {
            ...returnItem,
            customFields: returnItem.customFields || {}
          });
          
          const missing = nextStepInWorkflow.requiredFields.filter(fieldName => {
            // For system fields, check directly in returnItem
            if (Object.keys(fieldLabels).includes(fieldName)) {
              const isMissing = !returnItem[fieldName as keyof ReturnItem];
              console.log(`System field ${fieldName}: ${isMissing ? 'missing' : 'present'}`);
              return isMissing;
            } 
            // For custom fields, check in returnItem.customFields
            else {
              const isMissing = !returnItem.customFields || 
                     returnItem.customFields[fieldName] === undefined || 
                     returnItem.customFields[fieldName] === null || 
                     returnItem.customFields[fieldName] === '';
              console.log(`Custom field ${fieldName}: ${isMissing ? 'missing' : 'present'}, value:`, 
                        returnItem.customFields?.[fieldName]);
              return isMissing;
            }
          });
          
          console.log("Missing fields:", missing);
          setMissingRequiredFields(missing);
        } else {
          setMissingRequiredFields([]);
        }
      }
    }
  }, [workflow, returnItem])

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setIsSubmittingNote(true)
    try {
      await onAddNote(returnItem.id, newNote.trim())
      setNewNote('')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // Function to determine if a button should be shown for transitioning to the next status
  const shouldShowNextStatusButton = () => {
    // Don't show if we don't have workflow data
    if (!workflow || !currentStep || !nextStep) return false
    
    // Don't show if we're at the final step
    if (workflow.steps.findIndex(step => step.id === currentStep.id) === workflow.steps.length - 1) return false
    
    return true
  }
  
  // Handle status transition when there are no missing required fields
  const handleUpdateStatus = () => {
    console.log('ReturnDetailsDialog: handleUpdateStatus called', { 
      nextStep, 
      missingRequiredFields, 
      hasUpdateFn: !!onUpdateReturnFields,
      returnId: returnItem.id,
      currentStatus: returnItem.status,
      targetStatus: nextStep?.name
    });
    
    if (nextStep && missingRequiredFields.length === 0 && onUpdateReturnFields) {
      console.log('ReturnDetailsDialog: Attempting to update status to', nextStep.name);
      try {
        onUpdateReturnFields(returnItem.id, { status: nextStep.name })
          .then(() => {
            console.log('ReturnDetailsDialog: Status update successful');
          })
          .catch(error => {
            console.error('ReturnDetailsDialog: Status update failed', error);
          });
      } catch (error) {
        console.error('ReturnDetailsDialog: Error during status update call', error);
      }
    } else {
      console.log('ReturnDetailsDialog: Status update conditions not met', {
        hasNextStep: !!nextStep,
        noMissingFields: missingRequiredFields.length === 0,
        hasUpdateFn: !!onUpdateReturnFields
      });
    }
  }
  
  // Handle transition after the fields have been filled through the form
  const handleFieldsSave = async (updatedFields: Partial<ReturnItem>) => {
    console.log('ReturnDetailsDialog: handleFieldsSave called', { 
      updatedFields, 
      onUpdateReturnFields: !!onUpdateReturnFields,
      nextStep
    });
    
    if (!onUpdateReturnFields || !nextStep) {
      console.error('ReturnDetailsDialog: Missing onUpdateReturnFields or nextStep', {
        hasUpdateFn: !!onUpdateReturnFields,
        hasNextStep: !!nextStep
      });
      return;
    }
    
    try {
      // Update fields and status in a single operation
      const combinedUpdate = {
        ...updatedFields,
        status: nextStep.name
      };
      
      console.log('ReturnDetailsDialog: Updating fields and status', combinedUpdate);
      await onUpdateReturnFields(returnItem.id, combinedUpdate);
      
      // Close the sheet after successful update
      setIsStatusTransitionOpen(false);
    } catch (error) {
      console.error('Error updating fields and status:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0"
        aria-describedby="return-details-description"
      >
        <div id="return-details-description" className="sr-only">
          Details der Retoure #{returnItem.orderNumber || returnItem.id}, einschließlich Übersicht, Produkte, 
          benutzerdefinierte Felder, Dokumente und Verlauf.
        </div>
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-md bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <span>Retoure #{returnItem.orderNumber || returnItem.id}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 border-b border-border/40">
            <TabsList className="h-12 -mb-px">
              <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:text-primary">Übersicht</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:border-primary data-[state=active]:text-primary">Produkte</TabsTrigger>
              <TabsTrigger value="custom-fields" className="data-[state=active]:border-primary data-[state=active]:text-primary">Benutzerdefinierte Felder</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:border-primary data-[state=active]:text-primary">Dokumente</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:border-primary data-[state=active]:text-primary">Verlauf & Notizen</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="p-6 space-y-6 min-h-[400px]">
              {/* Status Card */}
              <div className="card-dashboard">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {currentStep ? (
                      <div className="p-2 rounded-md" style={{ backgroundColor: `${currentStep.color}20` }}>
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: currentStep.color }} />
                      </div>
                    ) : (
                      <div className="p-2 rounded-md bg-secondary/20">
                        <div className="w-5 h-5 rounded-full bg-secondary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{currentStep?.name || returnItem.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentStep?.description || 'Status'}
                        {returnItem.updatedAt && ` • Letzte Änderung: ${formatDate(returnItem.updatedAt)}`}
                      </p>
                    </div>
                    <div className="ml-auto space-x-2">
                      {/* Dynamic Status Change Button */}
                      {shouldShowNextStatusButton() && nextStep && (
                        <>
                          {missingRequiredFields.length > 0 ? (
                            <Button
                              variant="default"
                              className="flex items-center gap-2"
                              onClick={() => setIsStatusTransitionOpen(true)}
                            >
                              {nextStep.name}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleUpdateStatus}
                              className="flex items-center gap-2"
                            >
                              {nextStep.name}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* Special buttons for specific features */}
                      {returnItem.status === 'versandt' && 
                       returnItem.followUpAction === 'gutschrift' && 
                       !returnItem.creditNoteNumber && (
                        <CreditNoteDialog
                          onSubmit={(data) => onCreateCreditNote(returnItem.id, data)}
                          trigger={
                            <Button>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Gutschrift erstellen
                            </Button>
                          }
                        />
                      )}

                      {returnItem.creditNoteNumber && 
                       !returnItem.reconciliationInvoiceNumber && (
                        <ReconcileDialog
                          onSubmit={(data) => onReconcileCreditNote(returnItem.id, data)}
                          trigger={
                            <Button>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Abstimmen
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>

                  {/* Show missing required fields warning if any */}
                  {missingRequiredFields.length > 0 && nextStep && !isStatusTransitionOpen && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-700">Fehlende Informationen</p>
                          <p className="text-sm text-amber-600 mt-1">
                            Um zum Status "{nextStep.name}" zu wechseln, werden folgende Informationen benötigt:
                          </p>
                          <ul className="mt-1 ml-5 text-sm text-amber-600 list-disc">
                            {missingRequiredFields.map(field => (
                              <li key={field}>{fieldLabels[field] || field}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Transition Dialog */}
                  <StatusTransitionDialog
                    returnItem={returnItem}
                    currentStep={currentStep || undefined}
                    nextStep={nextStep || undefined}
                    open={isStatusTransitionOpen}
                    onOpenChange={setIsStatusTransitionOpen}
                    onSave={handleFieldsSave}
                  />

                  {/* Display workflow steps timeline */}
                  {workflow && workflow.steps && workflow.steps.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border/40">
                      <h4 className="text-sm font-medium mb-3">Prozessverlauf</h4>
                      <div className="flex items-center space-x-1">
                        {workflow.steps.map((step, index) => {
                          const isCurrent = currentStep?.id === step.id;
                          const isCompleted = workflow.steps.findIndex(s => s.id === currentStep?.id) > index;
                          
                          return (
                            <React.Fragment key={step.id}>
                              <div className="flex flex-col items-center">
                                <div 
                                  className={`w-3 h-3 rounded-full mb-1 ${
                                    isCurrent ? 'ring-2 ring-offset-2' : ''
                                  }`} 
                                  style={{ 
                                    backgroundColor: isCompleted || isCurrent ? step.color : '#e5e5e5',
                                    ...(isCurrent ? { ring: step.color } : {})
                                  }}
                                />
                                <span className={`text-xs ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`} style={{ 
                                  color: isCurrent ? step.color : undefined
                                }}>
                                  {step.name}
                                </span>
                              </div>
                              {index < workflow.steps.length - 1 && (
                                <div 
                                  className="w-8 h-0.5 mt-1" 
                                  style={{ backgroundColor: isCompleted ? workflow.steps[index].color : '#e5e5e5' }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Cards */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="card-dashboard group">
                  <div className="p-6">
                    <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                      Bestelldetails
                      <span className="text-primary">#</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bestellnummer</span>
                        <span className="font-medium">{returnItem.orderNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Lieferantenreferenz</span>
                        <span className="font-medium">{returnItem.supplierReference || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Folgeaktion</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBackground(returnItem.followUpAction)}`}>
                          {returnItem.followUpAction}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-dashboard group">
                  <div className="p-6">
                    <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                      Zeitlicher Verlauf
                      <Calendar className="h-4 w-4 text-primary" />
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Erstellt am</span>
                        <span className="font-medium">{formatDate(returnItem.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Beauftragt am</span>
                        <span className="font-medium">{formatDate(returnItem.commissioningDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Versandt am</span>
                        <span className="font-medium">{formatDate(returnItem.shippingDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Note Info */}
              {returnItem.creditNoteNumber && (
                <div className="card-dashboard">
                  <div className="p-6">
                    <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                      Gutschriftsinformationen
                      <CreditCard className="h-4 w-4 text-primary" />
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1.5">Gutschriftsnummer</span>
                        <span className="font-medium">{returnItem.creditNoteNumber}</span>
                      </div>
                      {returnItem.creditAmount && (
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1.5">Betrag</span>
                          <span className="font-medium">€{returnItem.creditAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {returnItem.reconciliationInvoiceNumber && (
                        <>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1.5">Abstimmbeleg</span>
                            <span className="font-medium">{returnItem.reconciliationInvoiceNumber}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1.5">Abstimmdatum</span>
                            <span className="font-medium">{formatDate(returnItem.reconciliationDate)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="p-6 min-h-[400px]">
              <div className="grid gap-6 sm:grid-cols-2">
                {returnItem.products.map((product, index) => (
                  <div key={index} className="card-dashboard group">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{product.productName}</h3>
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Menge</span>
                          <span className="font-medium">{product.quantity}</span>
                        </div>
                        {product.serialNumber && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Seriennummer</span>
                            <span className="font-medium">{product.serialNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t border-border/40">
                        <span className="text-sm text-muted-foreground block mb-2">Retourengrund</span>
                        <p className="text-sm">{product.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom-fields" className="p-6 min-h-[400px]">
              <div className="card-dashboard">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Benutzerdefinierte Felder</h3>
                    </div>
                    {onUpdateReturnFields && (
                      <Sheet open={activeCustomFieldsSheet} onOpenChange={setActiveCustomFieldsSheet}>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </Button>
                        </SheetTrigger>
                        <SheetContent aria-describedby="custom-fields-description">
                          <SheetHeader className="pb-6">
                            <SheetTitle className="flex items-center gap-2">
                              <Tag className="h-5 w-5 text-primary" />
                              Benutzerdefinierte Felder bearbeiten
                            </SheetTitle>
                          </SheetHeader>
                          
                          <p id="custom-fields-description" className="sr-only">
                            Bearbeiten Sie hier die benutzerdefinierten Felder für diese Retoure
                          </p>
                          
                          {onUpdateReturnFields && (
                            <CustomFieldsForm
                              returnItem={returnItem}
                              customFields={customFields}
                              workflowId={workflow?.id}
                              onSave={async (data: Partial<ReturnItem>) => {
                                try {
                                  await onUpdateReturnFields(returnItem.id, data);
                                  setActiveCustomFieldsSheet(false);
                                } catch (error) {
                                  console.error("Error updating custom fields", error);
                                }
                              }}
                            />
                          )}
                        </SheetContent>
                      </Sheet>
                    )}
                  </div>
                  
                  {isLoadingCustomFields || isLoadingWorkflow ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : workflow && workflow.steps && workflow.steps.length > 0 ? (
                    <div className="space-y-6">
                      {workflow.steps.map((step) => {
                        // Get fields that belong to this step
                        const stepFields = step.requiredFields
                          .filter(fieldKey => !Object.keys(fieldLabels).includes(fieldKey))
                          .map(fieldKey => ({
                            field: customFields.find(cf => cf.key === fieldKey),
                            value: returnItem.customFields?.[fieldKey]
                          }))
                          .filter(item => item.field); // Only include fields we found in customFields
                        
                        if (stepFields.length === 0) {
                          return null; // Don't show steps with no custom fields
                        }
                        
                        return (
                          <div key={step.id} className="border border-border rounded-md overflow-hidden">
                            <div 
                              className="p-3 flex items-center gap-2" 
                              style={{ backgroundColor: `${step.color}20` }}
                            >
                              {getStatusIcon(step.name, step.color)}
                              <h4 className="font-medium">{step.name}</h4>
                            </div>
                            <div className="p-4 divide-y divide-border/40">
                              {stepFields.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">Keine benutzerdefinierten Felder für diesen Status</p>
                              ) : (
                                stepFields.map(({ field, value }, index) => (
                                  field && (
                                    <div key={field.key} className={`py-3 ${index === 0 ? 'pt-0' : ''} ${index === stepFields.length - 1 ? 'pb-0 border-0' : ''}`}>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">{field.label}</span>
                                        <div className="font-medium">
                                          {formatCustomFieldValue(field, value)}
                                        </div>
                                      </div>
                                      {field.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                                      )}
                                    </div>
                                  )
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Show all other custom fields that aren't in the workflow steps */}
                      {returnItem.customFields && Object.keys(returnItem.customFields).length > 0 && (
                        <div>
                          {/* Filter to get only fields that aren't in any step's requiredFields */}
                          {(() => {
                            const allRequiredFields = workflow.steps
                              .flatMap(step => step.requiredFields)
                              .filter(fieldKey => !Object.keys(fieldLabels).includes(fieldKey));
                              
                            const otherFields = Object.entries(returnItem.customFields)
                              .filter(([key]) => !allRequiredFields.includes(key))
                              .map(([key, value]) => ({
                                field: customFields.find(cf => cf.key === key),
                                value
                              }))
                              .filter(item => item.field);
                              
                            if (otherFields.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div className="border border-border rounded-md overflow-hidden">
                                <div className="p-3 flex items-center gap-2 bg-muted/50">
                                  <Tag className="h-5 w-5 text-muted-foreground" />
                                  <h4 className="font-medium">Sonstige Felder</h4>
                                </div>
                                <div className="p-4 divide-y divide-border/40">
                                  {otherFields.map(({ field, value }, index) => (
                                    field && (
                                      <div key={field.key} className={`py-3 ${index === 0 ? 'pt-0' : ''} ${index === otherFields.length - 1 ? 'pb-0 border-0' : ''}`}>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-muted-foreground">{field.label}</span>
                                          <div className="font-medium">
                                            {formatCustomFieldValue(field, value)}
                                          </div>
                                        </div>
                                        {field.description && (
                                          <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                                        )}
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      {workflow.steps.every(step => 
                        step.requiredFields
                          .filter(fieldKey => !Object.keys(fieldLabels).includes(fieldKey))
                          .length === 0
                      ) && !Object.keys(returnItem.customFields || {}).length && (
                        <div className="text-center py-8">
                          <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Keine benutzerdefinierten Felder für diesen Workflow konfiguriert
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Kein Workflow für diese Retoure konfiguriert
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-6 min-h-[400px]">
              <div className="card-dashboard">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Dokumente</h3>
                      {(returnItem.documents || []).length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({(returnItem.documents || []).length})
                        </span>
                      )}
                    </div>
                    <Button
                      variant={showDocumentUpload ? "secondary" : "outline"}
                      onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showDocumentUpload ? "Abbrechen" : "Dokument hochladen"}
                    </Button>
                  </div>

                  {showDocumentUpload && (
                    <div className="mb-6 card-dashboard bg-muted/50">
                      <div className="p-6">
                        <DocumentUpload
                          returnId={returnItem.id}
                          onDocumentUploaded={(doc) => {
                            if (onAddDocument) {
                              onAddDocument(returnItem.id, doc);
                              returnItem.documents = [...(returnItem.documents || []), doc];
                            }
                            setShowDocumentUpload(false);
                          }}
                          apiUrl={apiUrl}
                        />
                      </div>
                    </div>
                  )}

                  {!(returnItem.documents || []).length && !showDocumentUpload ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Keine Dokumente vorhanden
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {(returnItem.documents || []).map(document => (
                        <DocumentViewer
                          key={document.id}
                          document={document}
                          onDeleteDocument={
                            onDeleteDocument ?
                              () => {
                                onDeleteDocument(document.id);
                                returnItem.documents = (returnItem.documents || [])
                                  .filter(d => d.id !== document.id);
                              } :
                              undefined
                          }
                          apiUrl={apiUrl}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6 min-h-[400px]">
              <div className="card-dashboard">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Notizen & Verlauf</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Add Note Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Neue Notiz hinzufügen..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddNote()
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || isSubmittingNote}
                      >
                        {isSubmittingNote ? 'Wird gespeichert...' : 'Hinzufügen'}
                      </Button>
                    </div>

                    {/* Notes Timeline */}
                    <div className="space-y-4">
                      {(returnItem.notes || []).length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Keine Notizen vorhanden
                          </p>
                        </div>
                      ) : (
                        (returnItem.notes || []).map((note: Note) => (
                          <div key={note.id} className="flex gap-4">
                            <div className="mt-1">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm">{note.content}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span className="font-medium">{note.author}</span>
                                <span>•</span>
                                <span>{formatDate(note.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to format custom field values based on their type
function formatCustomFieldValue(field: CustomField, value: any): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-muted-foreground italic">Nicht ausgefüllt</span>;
  }
  
  switch (field.type) {
    case 'date':
      return formatDate(value);
    case 'money':
      return `€${Number(value).toFixed(2)}`;
    case 'email':
      return (
        <a href={`mailto:${value}`} className="text-primary hover:underline">
          {value}
        </a>
      );
    case 'phone':
      return (
        <a href={`tel:${value}`} className="text-primary hover:underline">
          {value}
        </a>
      );
    default:
      return String(value);
  }
}

function getActionBackground(action: string): string {
  switch(action) {
    case 'gutschrift':
      return 'bg-success/15 text-success-foreground';
    case 'ersatz':
      return 'bg-info/15 text-info-foreground';
    case 'reparatur':
      return 'bg-warning/15 text-warning-foreground';
    case 'ausschuss':
      return 'bg-destructive/15 text-destructive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}
