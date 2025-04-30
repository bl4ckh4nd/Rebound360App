import React, { useState } from 'react'
import { UseQueryResult } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { 
  useWorkflows, 
  useWorkflow, 
  useCreateWorkflow, 
  useUpdateWorkflow, 
  useDeleteWorkflow,
  useCustomFields
} from '../../renderer/hooks/useSettings'
import { FollowUpAction, StatusStep, StatusWorkflow, WorkflowType } from '../../shared/types'
import { Loader2, Plus, Trash2, Edit, ArrowUp, ArrowDown } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '../../hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { v4 as uuidv4 } from 'uuid'

const workflowSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  followUpAction: z.union([
    z.literal('gutschrift'),
    z.literal('ersatz'),
    z.literal('reparatur'),
    z.literal('ausschuss'),
    z.literal('procurement')
  ]),
  workflowType: z.union([
    z.literal('return'),
    z.literal('procurement')
  ]),
  steps: z.array(z.object({
    name: z.string().min(1, 'Statusname ist erforderlich'),
    description: z.string().optional(),
    requiredFields: z.array(z.string())
  })).min(1, 'Mindestens ein Status ist erforderlich'),
  isDefault: z.boolean()
});

export function WorkflowSettings() {
  const { data: workflows = [], isLoading } = useWorkflows() as UseQueryResult<StatusWorkflow[], Error>
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [workflowType, setWorkflowType] = useState<WorkflowType>('return')
  
  if (isLoading) {
    return <div className="flex justify-center p-6"><Loader2 className="animate-spin h-8 w-8" /></div>
  }
  
  const defaultProcurementWorkflow: StatusWorkflow = {
    id: uuidv4(),
    name: 'Standard Beschaffungs-Workflow',
    workflowType: 'procurement',
    followUpAction: 'procurement',
    steps: [
      { 
        id: uuidv4(),
        name: 'draft',
        description: 'In Bearbeitung',
        color: '#94a3b8',
        order: 0,
        requiredFields: ['title', 'department'],
        transitions: ['submitted', 'cancelled'],
        permissions: {
          canEdit: ['requester', 'manager'],
          canTransition: ['requester', 'manager']
        }
      },
      { 
        id: uuidv4(),
        name: 'submitted',
        description: 'Eingereicht',
        color: '#3b82f6',
        order: 1,
        requiredFields: ['title', 'description', 'department', 'items', 'totalAmount'],
        transitions: ['manager_approval', 'rejected', 'draft'],
        permissions: {
          canEdit: ['manager'],
          canTransition: ['manager']
        }
      },
      { 
        id: uuidv4(),
        name: 'manager_approval',
        description: 'Abteilungsleiter-Freigabe',
        color: '#f59e0b',
        order: 2,
        requiredFields: ['department', 'budgetCode'],
        transitions: ['finance_approval', 'rejected', 'draft'],
        permissions: {
          canEdit: ['finance'],
          canTransition: ['finance']
        }
      },
      { 
        id: uuidv4(),
        name: 'finance_approval',
        description: 'Finanz-Freigabe',
        color: '#10b981',
        order: 3,
        requiredFields: ['budgetCode', 'totalAmount'],
        transitions: ['approved', 'rejected'],
        permissions: {
          canEdit: ['finance'],
          canTransition: ['finance']
        }
      },
      { 
        id: uuidv4(),
        name: 'approved',
        description: 'Genehmigt',
        color: '#059669',
        order: 4,
        requiredFields: [],
        transitions: ['completed'],
        permissions: {
          canEdit: ['procurement'],
          canTransition: ['procurement']
        }
      },
      { 
        id: uuidv4(),
        name: 'rejected',
        description: 'Abgelehnt',
        color: '#ef4444',
        order: 5,
        requiredFields: ['rejectReason'],
        transitions: ['draft'],
        permissions: {
          canEdit: ['requester'],
          canTransition: ['requester']
        }
      },
      { 
        id: uuidv4(),
        name: 'cancelled',
        description: 'Storniert',
        color: '#6b7280',
        order: 6,
        requiredFields: ['cancelReason'],
        transitions: [],
        permissions: {
          canEdit: [],
          canTransition: []
        }
      },
      {
        id: uuidv4(),
        name: 'completed',
        description: 'Abgeschlossen',
        color: '#059669',
        order: 7,
        requiredFields: [],
        transitions: [],
        permissions: {
          canEdit: [],
          canTransition: []
        }
      }
    ],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow-Einstellungen</h2>
        <Select
          value={workflowType}
          onValueChange={(type: WorkflowType) => setWorkflowType(type)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Workflow-Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="return">Retouren</SelectItem>
            <SelectItem value="procurement">Beschaffung</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="return">
        <TabsList>
          <TabsTrigger value="return">Retouren</TabsTrigger>
          <TabsTrigger value="procurement">Beschaffung</TabsTrigger>
        </TabsList>

        <TabsContent value="return" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows
              .filter(w => w.workflowType === 'return')
              .map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() => {
                    setSelectedWorkflowId(workflow.id)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => {
                    setSelectedWorkflowId(workflow.id)
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="procurement" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows
              .filter(w => w.workflowType === 'procurement')
              .map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() => {
                    setSelectedWorkflowId(workflow.id)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => {
                    setSelectedWorkflowId(workflow.id)
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Workflow Dialog */}
      <WorkflowDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
      
      {/* Edit Workflow Dialog */}
      {selectedWorkflowId && (
        <WorkflowDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          workflowId={selectedWorkflowId}
        />
      )}
      
      {/* Delete Workflow Dialog */}
      {selectedWorkflowId && (
        <DeleteWorkflowDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          workflowId={selectedWorkflowId}
        />
      )}
    </div>
  )
}

interface WorkflowCardProps {
  workflow: StatusWorkflow
  onEdit: () => void
  onDelete: () => void
}

function WorkflowCard({ workflow, onEdit, onDelete }: WorkflowCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">{workflow.name}</h3>
            {workflow.isDefault && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Standard</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getActionName(workflow.followUpAction)}
          </p>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="grid gap-1">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: step.color }}
            />
            <span>{step.name}</span>
            {index < workflow.steps.length - 1 && (
              <ArrowDown className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface WorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  workflowId?: string
}

function WorkflowDialog({ open, onOpenChange, mode, workflowId }: WorkflowDialogProps) {
  const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflow(
    mode === 'edit' ? workflowId : undefined
  ) as UseQueryResult<StatusWorkflow | undefined, Error>
  
  const createWorkflowMutation = useCreateWorkflow()
  const updateWorkflowMutation = useUpdateWorkflow(
    mode === 'edit' ? workflowId : undefined
  )
  
  const [formData, setFormData] = useState<Omit<StatusWorkflow, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    followUpAction: 'gutschrift',
    steps: [],
    isDefault: false,
    workflowType: 'return' // Add default workflow type
  })
  
  // Initialize form with workflow data if editing
  React.useEffect(() => {
    if (mode === 'edit' && workflow) {
      setFormData({
        name: workflow.name,
        followUpAction: workflow.followUpAction,
        steps: workflow.steps,
        isDefault: workflow.isDefault,
        workflowType: workflow.workflowType || 'return' // Set type from existing workflow
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        followUpAction: 'gutschrift',
        steps: [],
        isDefault: false,
        workflowType: 'return'
      })
    }
  }, [mode, workflow, open])
  
  const handleSubmit = () => {
    const data = {
      ...formData,
      steps: formData.steps.map((step, index) => ({
        ...step,
        order: index
      }))
    }
    
    if (mode === 'create') {
      createWorkflowMutation.mutate(data)
    } else if (workflowId) {
      updateWorkflowMutation.mutate({ ...data, id: workflowId })
    }
    
    onOpenChange(false)
  }
  
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }
  
  const handleChangeAction = (action: string) => {
    setFormData(prev => ({ ...prev, followUpAction: action as FollowUpAction }))
  }
  
  const handleToggleDefault = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }))
  }
  
  const handleAddStep = () => {
    const newStep: StatusStep = {
      id: `temp-${Date.now()}`,
      name: 'Neuer Status',
      description: '',
      color: '#cccccc',
      order: formData.steps.length,
      requiredFields: [],
      workflowId: workflowId || '',
    }
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }
  
  const handleUpdateStep = (index: number, updates: Partial<StatusStep>) => {
    setFormData(prev => {
      const newSteps = [...prev.steps]
      newSteps[index] = { ...newSteps[index], ...updates }
      return { ...prev, steps: newSteps }
    })
  }
  
  const handleMoveStep = (stepIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && stepIndex === 0) || 
      (direction === 'down' && stepIndex === formData.steps.length - 1)
    ) {
      return
    }
    
    setFormData(prev => {
      const steps = [...prev.steps]
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1
      
      // Swap elements using a temporary variable
      const temp = steps[stepIndex]
      steps[stepIndex] = steps[targetIndex]
      steps[targetIndex] = temp
      
      // Update order values
      steps.forEach((step, i) => {
        step.order = i
      })
      
      return { ...prev, steps }
    })
  }
  
  const handleRemoveStep = (index: number) => {
    setFormData(prev => {
      const newSteps = prev.steps.filter((_, i) => i !== index)
      
      // Update order values
      newSteps.forEach((step, i) => {
        step.order = i
      })
      
      return { ...prev, steps: newSteps }
    })
  }
  
  const isLoading = isLoadingWorkflow || 
    createWorkflowMutation.status === 'pending' || 
    updateWorkflowMutation.status === 'pending'
    
  const isSubmitDisabled = isLoading || !formData.name || formData.steps.length === 0
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neuen Workflow erstellen' : 'Workflow bearbeiten'}
          </DialogTitle>
          <DialogDescription>
            Definieren Sie einen Status-Workflow für einen bestimmten Prozesstyp
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingWorkflow ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow-Name</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Standard-Gutschrift"
                    value={formData.name}
                    onChange={handleChangeName}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workflowType">Workflow-Typ</Label>
                  <Select
                    value={formData.workflowType}
                    onValueChange={(type: WorkflowType) => {
                      setFormData(prev => ({
                        ...prev,
                        workflowType: type as WorkflowType,
                        // Reset follow-up action based on type
                        followUpAction: type === 'return' ? 'gutschrift' : 'procurement'
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="return">Retoure</SelectItem>
                      <SelectItem value="procurement">Beschaffung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Folgeaktion</Label>
                <Select
                  value={formData.followUpAction}
                  onValueChange={(action: FollowUpAction) => handleChangeAction(action)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.workflowType === 'return' ? (
                      <>
                        <SelectItem value="gutschrift">Gutschrift</SelectItem>
                        <SelectItem value="ersatz">Ersatz</SelectItem>
                        <SelectItem value="reparatur">Reparatur</SelectItem>
                        <SelectItem value="ausschuss">Ausschuss</SelectItem>
                      </>
                    ) : (
                      <SelectItem value="procurement">Beschaffung</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={handleToggleDefault}
                  id="isDefault"
                />
                <Label htmlFor="isDefault">
                  Als Standard-Workflow für {getActionName(formData.followUpAction)} festlegen
                </Label>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Status-Schritte</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                    <Plus className="mr-1 h-3 w-3" /> Status hinzufügen
                  </Button>
                </div>
                
                {formData.steps.length === 0 ? (
                  <div className="text-center p-6 border rounded-md border-dashed">
                    <p className="text-muted-foreground">Noch keine Status-Schritte definiert</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddStep}>
                      <Plus className="mr-1 h-3 w-3" /> Status hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <StepItem
                        key={step.id}
                        step={step}
                        index={index}
                        totalSteps={formData.steps.length}
                        workflowType={formData.workflowType} // Pass workflow type to StepItem
                        onUpdate={(updates) => handleUpdateStep(index, updates)}
                        onMove={(direction) => handleMoveStep(index, direction)}
                        onRemove={() => handleRemoveStep(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isSubmitDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Workflow erstellen' : 'Änderungen speichern'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface StepItemProps {
  step: StatusStep
  index: number
  totalSteps: number
  workflowType: WorkflowType // Add workflow type prop
  onUpdate: (updates: Partial<StatusStep>) => void
  onMove: (direction: 'up' | 'down') => void
  onRemove: () => void
}

function StepItem({ step, index, totalSteps, workflowType, onUpdate, onMove, onRemove }: StepItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: customFields = [] } = useCustomFields()
  
  // System fields for procurement workflows
  const procurementSystemFields = [
    { id: 'title', name: 'Titel', group: 'Allgemeine Informationen' },
    { id: 'description', name: 'Beschreibung', group: 'Allgemeine Informationen' },
    { id: 'department', name: 'Abteilung', group: 'Allgemeine Informationen' },
    { id: 'priority', name: 'Priorität', group: 'Allgemeine Informationen' },
    { id: 'requesterName', name: 'Anforderer', group: 'Allgemeine Informationen' },
    { id: 'neededBy', name: 'Benötigt bis', group: 'Zeitplanung' },
    { id: 'budgetCode', name: 'Budgetcode', group: 'Finanzen' },
    { id: 'totalAmount', name: 'Gesamtbetrag', group: 'Finanzen' },
    { id: 'items', name: 'Artikelliste', group: 'Artikel' },
    { id: 'rejectReason', name: 'Ablehnungsgrund', group: 'Status' },
    { id: 'cancelReason', name: 'Stornierungsgrund', group: 'Status' }
  ]

  // System fields for return workflows
  const returnSystemFields = [
    { id: 'commissioningDate', name: 'Beauftragt am', group: 'Systeminformationen' },
    { id: 'shippingDate', name: 'Versanddatum', group: 'Systeminformationen' },
    { id: 'creditDate', name: 'Gutschriftsdatum', group: 'Gutschrift' },
    { id: 'creditNoteNumber', name: 'Gutschriftsnummer', group: 'Gutschrift' },
    { id: 'creditAmount', name: 'Gutschriftsbetrag', group: 'Gutschrift' },
    { id: 'originalInvoiceNumber', name: 'Original-Rechnungsnummer', group: 'Gutschrift' },
    { id: 'reconciliationInvoiceNumber', name: 'Abstimmbeleg', group: 'Gutschrift' },
    { id: 'reconciliationDate', name: 'Abstimmdatum', group: 'Gutschrift' },
    { id: 'creditorNumber', name: 'Kreditorennummer', group: 'Gutschrift' }
  ]

  // Select fields based on workflow type
  const systemFields = workflowType === 'procurement' 
    ? procurementSystemFields 
    : returnSystemFields

  // Group system fields by category
  const systemFieldGroups = systemFields.reduce((groups: Record<string, typeof systemFields>, field) => {
    if (!groups[field.group]) {
      groups[field.group] = []
    }
    groups[field.group].push(field)
    return groups
  }, {})

  // Filter custom fields by entity type
  const filteredCustomFields = customFields.filter(field => 
    field.entityType === (workflowType === 'procurement' ? 'requisition' : 'return')
  )

  // Convert custom fields to the same format as system fields
  const customFieldItems = filteredCustomFields.map(field => ({
    id: field.key,
    name: field.label,
    group: 'Benutzerdefinierte Felder',
    type: field.type
  }))
  
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: step.color }}
          />
          <Input 
            className="max-w-[200px] h-8"
            value={step.name} 
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>
        
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Weniger' : 'Mehr'}
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMove('up')} 
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMove('down')} 
            disabled={index === totalSteps - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onRemove} 
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-3 border-t pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`step-${index}-description`} className="text-xs">Beschreibung</Label>
              <Input 
                id={`step-${index}-description`}
                value={step.description || ''} 
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Beschreibung des Status"
                className="h-8"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`step-${index}-color`} className="text-xs">Farbe</Label>
              <div className="flex space-x-2">
                <input 
                  type="color" 
                  id={`step-${index}-color`}
                  value={step.color} 
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-8 h-8 rounded"
                />
                <Input 
                  value={step.color} 
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-xs">Erforderliche Felder</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Wählen Sie die Felder aus, die ausgefüllt sein müssen, um zu diesem Status zu wechseln.
            </div>
            
            {/* Display selected required fields as badges */}
            {step.requiredFields.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {step.requiredFields.map(fieldId => {
                  const systemField = systemFields.find(f => f.id === fieldId)
                  const customField = customFields.find(f => f.key === fieldId)
                  const fieldName = systemField?.name || customField?.label || fieldId
                  
                  return (
                    <Badge key={fieldId} variant="secondary" className="flex items-center gap-1 pr-1">
                      {fieldName}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdate({
                          requiredFields: step.requiredFields.filter(id => id !== fieldId)
                        })}
                        className="h-5 w-5 p-0 rounded-full"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>
            )}
            
            {/* System fields grouped by category */}
            {Object.entries(systemFieldGroups).map(([group, fields]) => (
              <div key={group} className="mb-4">
                <h4 className="text-sm font-medium mb-2">{group}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {fields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`step-${index}-field-${field.id}`}
                        checked={step.requiredFields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onUpdate({ 
                              requiredFields: [...step.requiredFields, field.id] 
                            })
                          } else {
                            onUpdate({ 
                              requiredFields: step.requiredFields.filter(id => id !== field.id) 
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`step-${index}-field-${field.id}`} className="text-sm">
                        {field.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Custom fields section */}
            {customFieldItems.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Benutzerdefinierte Felder</h4>
                <div className="grid grid-cols-2 gap-2">
                  {customFieldItems.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`step-${index}-field-${field.id}`}
                        checked={step.requiredFields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onUpdate({ 
                              requiredFields: [...step.requiredFields, field.id] 
                            })
                          } else {
                            onUpdate({ 
                              requiredFields: step.requiredFields.filter(id => id !== field.id) 
                            })
                          }
                        }}
                      />
                      <div className="flex items-center">
                        <Label htmlFor={`step-${index}-field-${field.id}`} className="text-sm">
                          {field.name}
                        </Label>
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          {field.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {customFieldItems.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                Keine benutzerdefinierten Felder definiert. Sie können diese im Tab 
                "Benutzerdefinierte Felder" erstellen.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface DeleteWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
}

function DeleteWorkflowDialog({ open, onOpenChange, workflowId }: DeleteWorkflowDialogProps) {
  const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflow(workflowId) as UseQueryResult<
    StatusWorkflow | undefined,
    Error
  >
  
  const deleteWorkflowMutation = useDeleteWorkflow()
  
  const handleDelete = () => {
    deleteWorkflowMutation.mutate(workflowId, {
      onSuccess: () => onOpenChange(false)
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workflow löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie diesen Workflow löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingWorkflow ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            {workflow && (
              <div className="py-2">
                <p><strong>Name:</strong> {workflow.name}</p>
                <p><strong>Aktion:</strong> {getActionName(workflow.followUpAction)}</p>
                <p><strong>Status-Schritte:</strong> {workflow.steps.length}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleteWorkflowMutation.status === 'pending'}
              >
                {deleteWorkflowMutation.status === 'pending' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Workflow löschen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function getActionName(action: FollowUpAction): string {
  switch (action) {
    case 'gutschrift':
      return 'Gutschrift';
    case 'ersatz':
      return 'Ersatzlieferung';
    case 'reparatur':
      return 'Reparatur';
    case 'ausschuss':
      return 'Ausschuss';
    case 'procurement':
      return 'Beschaffung';
    default:
      return action;
  }
}