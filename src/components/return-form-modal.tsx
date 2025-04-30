import React from 'react'
import { Package, Plus, Trash2, Send, Check, ChevronUp, ChevronDown, FileText, CheckIcon, ChevronsUpDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from './ui/button'
import { Input } from './ui/input'
import { CardContent } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import { cn } from "../lib/utils"
import { DocumentUpload } from './document-upload'
import { DocumentViewer } from './document-viewer'
import type { ReturnItem, FollowUpAction, Document, Supplier } from '../shared/types'
import { API_BASE_URL } from '../shared/config'
import { useWorkflowByAction } from '../renderer/hooks/useSettings'
import { useCreateDraftReturn, useUpdateDraftReturn, useDeleteDraftReturn, useDeleteDocument } from '../renderer/hooks/useReturns.ts'
import { useSuppliers } from '../renderer/hooks/useSuppliers.ts'
import { useToast } from '../hooks/use-toast'

interface ReturnFormModalProps {
  onSubmit: (returnData: Omit<ReturnItem, 'id' | 'status' | 'notes'> & { id?: string }) => Promise<ReturnItem>
}

const emptyProduct = {
  productName: '',
  quantity: 1,
  reason: ''
}

export function ReturnFormModal({ onSubmit }: ReturnFormModalProps) {
  const { success } = useToast()
  const [formData, setFormData] = React.useState({
    id: '',
    products: [{
      productName: '',
      quantity: 1,
      reason: ''
    }],
    orderNumber: '',
    followUpAction: 'gutschrift' as FollowUpAction,
    supplierReference: ''
  })

  const { data: selectedWorkflow } = useWorkflowByAction(formData.followUpAction)
  const { data: suppliers, isLoading: suppliersLoading, error: suppliersError } = useSuppliers()
  
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [showDocumentUpload, setShowDocumentUpload] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [collapsedProducts, setCollapsedProducts] = React.useState<Record<number, boolean>>({})
  const [supplierComboboxOpen, setSupplierComboboxOpen] = React.useState(false)

  const createDraftMutation = useCreateDraftReturn()
  const updateDraftMutation = useUpdateDraftReturn()
  const deleteDraftMutation = useDeleteDraftReturn()
  const deleteDocumentMutation = useDeleteDocument(formData.id)

  // Create a draft return record when the modal opens
  React.useEffect(() => {
    const createDraft = async () => {
      if (open && !formData.id) {
        try {
          const draftReturn = await createDraftMutation.mutateAsync()
          setFormData(prev => ({
            ...prev,
            id: draftReturn.id
          }))
        } catch (error) {
          console.error('Error creating draft return:', error)
        }
      }
    }

    createDraft()
  }, [open, formData.id])

  // Reset everything when modal closes
  React.useEffect(() => {
    if (!open) {
      // If we have an ID but haven't submitted successfully, delete the draft
      if (formData.id && !showSuccess) {
        deleteDraftMutation.mutate(formData.id)
      }

      setDocuments([])
      setShowDocumentUpload(false)
      setFormData({
        id: '',
        products: [{
          productName: '',
          quantity: 1,
          reason: ''
        }],
        orderNumber: '',
        followUpAction: 'gutschrift',
        supplierReference: ''
      })
      setShowSuccess(false)
      setSupplierComboboxOpen(false)
    }
  }, [open, formData.id, showSuccess])

  const onBlur = (index: number, field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [`${index}-${field}`]: true
    }))
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...emptyProduct }]
    }))
  }

  const removeProduct = (index: number) => {
    if (formData.products.length <= 1) {
      return // Prevent removing the last product
    }
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const updateProduct = (index: number, field: keyof typeof emptyProduct, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => {
        if (i === index) {
          // Handle quantity conversion safely
          if (field === 'quantity') {
            const numValue = parseInt(String(value))
            return { ...product, [field]: isNaN(numValue) ? 1 : Math.max(1, numValue) }
          }
          return { ...product, [field]: value }
        }
        return product
      })
    }))
  }

  const toggleProduct = (index: number) => {
    setCollapsedProducts(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleDocumentUploaded = (document: Document) => {
    setDocuments(prev => [...prev, document])
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentMutation.mutateAsync(documentId)
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        id: formData.id
      })
      setShowSuccess(true)
      success("Die Retoure wurde erfolgreich erstellt", {
        description: "Sie können die Retoure jetzt in der Übersicht sehen."
      })
      setOpen(false)
    } catch (error) {
      console.error('Error submitting return:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keep getInitialStatus for display purposes only
  const getInitialStatus = () => {
    if (selectedWorkflow && selectedWorkflow.steps && selectedWorkflow.steps.length > 0) {
      return selectedWorkflow.steps[0].name
    }
    return 'ausstehend' // Default fallback status
  }

  const handleFollowUpActionChange = (action: FollowUpAction) => {
    setFormData(prev => ({ ...prev, followUpAction: action }))
  }

  const isValid = formData.products.length > 0 && formData.products.every(
    product => product.productName && product.reason && product.quantity > 0
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Neue Retoure
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Retoure erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bestellnummer (Optional)</label>
              <Input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                placeholder="Bestellnummer eingeben"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lieferantenreferenz</label>
              <Popover open={supplierComboboxOpen} onOpenChange={setSupplierComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={supplierComboboxOpen}
                    className="w-full justify-between"
                  >
                    {formData.supplierReference || "Lieferanten auswählen oder eingeben..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Lieferanten suchen oder neu eingeben..." 
                      value={formData.supplierReference}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, supplierReference: value }))}
                    />
                    <CommandList>
                      {suppliersLoading && <CommandItem disabled>Lade Lieferanten...</CommandItem>}
                      {suppliersError && <CommandItem disabled>Fehler beim Laden</CommandItem>}
                      {!suppliersLoading && !suppliersError && suppliers?.length === 0 && (
                        <CommandEmpty>Keine Lieferanten gefunden. Geben Sie einen neuen ein.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {suppliers && suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.jtl_id}
                            value={supplier.company_name || supplier.supplier_number || ''}
                            onSelect={(currentValue: string) => {
                              const selectedName = supplier.company_name || supplier.supplier_number || ''
                              setFormData(prev => ({ ...prev, supplierReference: currentValue === selectedName ? "" : selectedName }))
                              setSupplierComboboxOpen(false)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.supplierReference === (supplier.company_name || supplier.supplier_number) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {supplier.company_name || `Nr: ${supplier.supplier_number}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Produkte</label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addProduct}
              >
                <Plus className="w-4 h-4 mr-2" />
                Produkt hinzufügen
              </Button>
            </div>

            <div className="space-y-4">
              {formData.products.map((product, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProduct(index)}
                      >
                        {collapsedProducts[index] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </Button>
                      <h4 className="text-sm font-medium">
                        Produkt {index + 1}
                        {product.productName && (
                          <span className="ml-2 text-gray-500">
                            - {product.productName}
                          </span>
                        )}
                      </h4>
                    </div>
                    <div>
                      {formData.products.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {!collapsedProducts[index] && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Produktname</label>
                          <Input
                            required
                            type="text"
                            value={product.productName}
                            onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                            onBlur={() => onBlur(index, 'productName')}
                            placeholder="Produktname eingeben"
                            className={touchedFields[`${index}-productName`] && !product.productName ? 'border-red-500' : ''}
                          />
                          {touchedFields[`${index}-productName`] && !product.productName && (
                            <span className="text-xs text-red-500">Produktname ist erforderlich</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Menge</label>
                          <Input
                            required
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                            onBlur={() => onBlur(index, 'quantity')}
                            className={touchedFields[`${index}-quantity`] && product.quantity < 1 ? 'border-red-500' : ''}
                          />
                          {touchedFields[`${index}-quantity`] && product.quantity < 1 && (
                            <span className="text-xs text-red-500">Menge muss mindestens 1 sein</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Retourengrund</label>
                        <textarea
                          required
                          value={product.reason}
                          onChange={(e) => updateProduct(index, 'reason', e.target.value)}
                          onBlur={() => onBlur(index, 'reason')}
                          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            touchedFields[`${index}-reason`] && !product.reason ? 'border-red-500' : ''
                          }`}
                          placeholder="Beschreiben Sie den Retourengrund"
                        />
                        {touchedFields[`${index}-reason`] && !product.reason && (
                          <span className="text-xs text-red-500">Retourengrund ist erforderlich</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-sm font-medium">Dokumente</h3>
                {documents.length > 0 && (
                  <span className="text-xs text-muted-foreground">({documents.length})</span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showDocumentUpload ? "Abbrechen" : "Dokument hinzufügen"}
              </Button>
            </div>

            {showDocumentUpload && formData.id && (
              <div className="border rounded-md p-4 bg-muted/10">
                <DocumentUpload
                  returnId={formData.id}
                  onDocumentUploaded={(doc) => {
                    handleDocumentUploaded(doc)
                    setShowDocumentUpload(false)
                  }}
                />
              </div>
            )}

            {documents.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {documents.map(doc => (
                  <DocumentViewer
                    key={doc.id}
                    document={doc}
                    onDeleteDocument={() => handleDeleteDocument(doc.id)}
                    apiUrl={API_BASE_URL}
                  />
                ))}
              </div>
            ) : !showDocumentUpload ? (
              <p className="text-sm text-muted-foreground">
                Keine Dokumente hinzugefügt. Klicken Sie auf "Dokument hinzufügen", um Fotos, PDFs oder andere Dokumente hochzuladen.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Folgeaktion</label>
              {selectedWorkflow && (
                <span className="text-xs text-muted-foreground">
                  Erster Status: {getInitialStatus()}
                </span>
              )}
            </div>
            <select
              value={formData.followUpAction}
              onChange={(e) => handleFollowUpActionChange(e.target.value as FollowUpAction)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="gutschrift">Gutschrift</option>
              <option value="ersatz">Ersatz</option>
              <option value="reparatur">Reparatur</option>
              <option value="ausschuss">Ausschuss</option>
            </select>
            {selectedWorkflow && (
              <p className="text-xs text-muted-foreground mt-1">
                Workflow: {selectedWorkflow.name}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span>Wird erstellt...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Retoure erstellen
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
