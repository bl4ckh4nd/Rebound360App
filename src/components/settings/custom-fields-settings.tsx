import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  useCustomFields,
  useCustomField,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField
} from '../../renderer/hooks/useSettings'
import { CustomField, CustomFieldType } from '../../shared/types'
import { Loader2, Plus, Trash2, Edit, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

export function CustomFieldsSettings() {
  const { data: fields = [], isLoading } = useCustomFields()
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  if (isLoading) {
    return <div className="flex justify-center p-6"><Loader2 className="animate-spin h-8 w-8" /></div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Benutzerdefinierte Felder</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Feld erstellen
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <CustomFieldCard 
            key={field.id} 
            field={field}
            onEdit={() => {
              setSelectedFieldId(field.id)
              setIsEditDialogOpen(true)
            }}
            onDelete={() => {
              setSelectedFieldId(field.id)
              setIsDeleteDialogOpen(true)
            }}
          />
        ))}
        
        {fields.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            Keine benutzerdefinierten Felder gefunden. Erstellen Sie ein neues Feld, um zu beginnen.
          </div>
        )}
      </div>
      
      {/* Create Field Dialog */}
      <CustomFieldDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
      
      {/* Edit Field Dialog */}
      {selectedFieldId && (
        <CustomFieldDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          fieldId={selectedFieldId}
        />
      )}
      
      {/* Delete Field Dialog */}
      {selectedFieldId && (
        <DeleteCustomFieldDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          fieldId={selectedFieldId}
        />
      )}
    </div>
  )
}

interface CustomFieldCardProps {
  field: CustomField
  onEdit: () => void
  onDelete: () => void
}

function CustomFieldCard({ field, onEdit, onDelete }: CustomFieldCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{field.label}</h3>
            <Badge variant="outline" className="text-xs">
              {field.key}
            </Badge>
            <Badge className={cn(
              "text-xs",
              getFieldTypeBadgeColor(field.type)
            )}>
              {getFieldTypeLabel(field.type)}
            </Badge>
            {field.required && (
              <Badge variant="destructive" className="text-xs">Pflichtfeld</Badge>
            )}
          </div>
          {field.description && (
            <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
          )}
          
          {field.type === 'select' && field.options && field.options.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Optionen: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {field.options.map((option, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{option}</Badge>
                ))}
              </div>
            </div>
          )}
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
    </div>
  )
}

function getFieldTypeLabel(type: CustomFieldType): string {
  switch (type) {
    case 'text': return 'Text'
    case 'number': return 'Zahl'
    case 'date': return 'Datum'
    case 'money': return 'Betrag'
    case 'email': return 'E-Mail'
    case 'phone': return 'Telefon'
    case 'select': return 'Auswahl'
    default: return type
  }
}

function getFieldTypeBadgeColor(type: CustomFieldType): string {
  switch (type) {
    case 'text': return 'bg-blue-100 text-blue-800'
    case 'number': return 'bg-green-100 text-green-800'
    case 'date': return 'bg-purple-100 text-purple-800'
    case 'money': return 'bg-amber-100 text-amber-800'
    case 'email': return 'bg-pink-100 text-pink-800'
    case 'phone': return 'bg-cyan-100 text-cyan-800'
    case 'select': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

interface CustomFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  fieldId?: string
}

function CustomFieldDialog({ open, onOpenChange, mode, fieldId }: CustomFieldDialogProps) {
  const { data: field, isLoading: isLoadingField } = useCustomField(
    mode === 'edit' ? fieldId : undefined
  )
  
  const createFieldMutation = useCreateCustomField()
  const updateFieldMutation = useUpdateCustomField(
    mode === 'edit' ? fieldId : undefined
  )
  
  const [formData, setFormData] = useState<Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>>({
    key: '',
    label: '',
    description: '',
    type: 'text',
    required: false,
    options: []
  })
  
  const [newOption, setNewOption] = useState<string>('')
  const [keyError, setKeyError] = useState<string | null>(null)
  
  // Initialize form with field data if editing
  React.useEffect(() => {
    if (mode === 'edit' && field) {
      setFormData({
        key: field.key,
        label: field.label,
        description: field.description || '',
        type: field.type,
        required: field.required,
        options: field.options || [],
        defaultValue: field.defaultValue
      })
    } else if (mode === 'create') {
      setFormData({
        key: '',
        label: '',
        description: '',
        type: 'text',
        required: false,
        options: []
      })
      setKeyError(null)
    }
  }, [mode, field, open])
  
  const handleSubmit = () => {
    // Convert key to valid format (snake_case)
    const formattedKey = formData.key.trim() || formatKeyFromLabel(formData.label);
    
    if (!formattedKey || !formData.label || !formData.type) {
      toast.error("Fehlerhafte Eingabe", {
        description: "Bitte füllen Sie alle erforderlichen Felder aus."
      })
      return
    }
    
    // For select type, ensure options exist
    if (formData.type === 'select' && (!formData.options || formData.options.length === 0)) {
      toast.error("Fehlerhafte Eingabe", {
        description: "Auswahlfelder benötigen mindestens eine Option."
      })
      return
    }
    
    const submissionData = {
      ...formData,
      key: formattedKey
    }
    
    if (mode === 'create') {
      createFieldMutation.mutate(submissionData, {
        onSuccess: () => {
          toast.success("Feld erstellt", {
            description: `Das Feld "${submissionData.label}" wurde erfolgreich erstellt.`
          })
          onOpenChange(false)
        },
        onError: (error: any) => {
          if (error?.message?.includes('already exists')) {
            setKeyError('Ein Feld mit diesem Schlüssel existiert bereits.')
          } else {
            toast.error("Fehler", {
              description: "Das Feld konnte nicht erstellt werden."
            })
          }
        }
      })
    } else if (mode === 'edit' && fieldId) {
      updateFieldMutation.mutate(submissionData, {
        onSuccess: () => {
          toast.success("Feld aktualisiert", {
            description: `Das Feld "${submissionData.label}" wurde erfolgreich aktualisiert.`
          })
          onOpenChange(false)
        },
        onError: (error: any) => {
          if (error?.message?.includes('already exists')) {
            setKeyError('Ein Feld mit diesem Schlüssel existiert bereits.')
          } else {
            toast.error("Fehler", {
              description: "Das Feld konnte nicht aktualisiert werden."
            })
          }
        }
      })
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear key error when key changes
    if (name === 'key') {
      setKeyError(null)
    }
  }
  
  const handleTypeChange = (type: CustomFieldType) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      // Reset defaultValue if type changes
      defaultValue: undefined
    }))
  }
  
  const toggleRequired = (checked: boolean) => {
    setFormData(prev => ({ ...prev, required: checked }))
  }
  
  const addOption = () => {
    if (!newOption.trim()) return
    
    setFormData(prev => {
      const updatedOptions = [...(prev.options || []), newOption.trim()]
      return { ...prev, options: updatedOptions }
    })
    setNewOption('')
  }
  
  const removeOption = (index: number) => {
    setFormData(prev => {
      const updatedOptions = [...(prev.options || [])]
      updatedOptions.splice(index, 1)
      return { ...prev, options: updatedOptions }
    })
  }
  
  // Format a key from the label (convert to snake_case)
  const formatKeyFromLabel = (label: string): string => {
    return label
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
  }
  
  const isLoading = isLoadingField || 
    createFieldMutation.isPending || 
    updateFieldMutation.isPending
    
  const isSubmitDisabled = isLoading || !formData.label || !formData.type || 
    (formData.type === 'select' && (!formData.options || formData.options.length === 0))
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neues benutzerdefiniertes Feld erstellen' : 'Benutzerdefiniertes Feld bearbeiten'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Erstellen Sie ein neues benutzerdefiniertes Feld für Ihre Workflows' 
              : 'Bearbeiten Sie das ausgewählte benutzerdefinierte Feld'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingField ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Bezeichnung *</Label>
                  <Input
                    id="label"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="z.B. Bearbeiter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="key">Schlüssel *</Label>
                  <div>
                    <Input
                      id="key"
                      name="key"
                      value={formData.key}
                      onChange={handleInputChange}
                      placeholder="z.B. processor (wird automatisch generiert)"
                      className={keyError ? "border-red-500" : ""}
                    />
                    {keyError && (
                      <div className="flex items-center mt-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {keyError}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Ein eindeutiger Bezeichner für dieses Feld. Wird automatisch aus der Bezeichnung generiert, wenn leer gelassen.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optionale Beschreibung des Felds"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Feldtyp *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleTypeChange(value as CustomFieldType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Zahl</SelectItem>
                      <SelectItem value="date">Datum</SelectItem>
                      <SelectItem value="money">Betrag</SelectItem>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="select">Auswahl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={formData.required}
                      onCheckedChange={toggleRequired}
                    />
                    <Label htmlFor="required">Pflichtfeld</Label>
                  </div>
                </div>
              </div>
              
              {/* Options for select field type */}
              {formData.type === 'select' && (
                <div className="space-y-2 border rounded-md p-4">
                  <Label>Auswahlmöglichkeiten</Label>
                  
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Neue Option hinzufügen"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addOption()
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={addOption}
                      disabled={!newOption.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.options && formData.options.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <span className="flex-1">{option}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="h-8 w-8 p-0 text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-2 text-muted-foreground text-sm">
                      Keine Optionen definiert. Fügen Sie mindestens eine Option hinzu.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isSubmitDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Feld erstellen' : 'Änderungen speichern'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DeleteCustomFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fieldId: string
}

function DeleteCustomFieldDialog({ open, onOpenChange, fieldId }: DeleteCustomFieldDialogProps) {
  const { data: field, isLoading: isLoadingField } = useCustomField(fieldId)
  const deleteFieldMutation = useDeleteCustomField()
  
  const handleDelete = () => {
    deleteFieldMutation.mutate(fieldId, {
      onSuccess: () => {
        toast.success("Feld gelöscht", {
          description: "Das benutzerdefinierte Feld wurde erfolgreich gelöscht."
        })
        onOpenChange(false)
      },
      onError: (error: any) => {
        if (error?.message?.includes('used in workflow steps')) {
          toast.error("Löschen nicht möglich", {
            description: "Dieses Feld wird in Workflow-Schritten verwendet und kann nicht gelöscht werden."
          })
        } else {
          toast.error("Fehler", {
            description: "Das Feld konnte nicht gelöscht werden."
          })
        }
      }
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzerdefiniertes Feld löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie dieses Feld löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingField ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            {field && (
              <div className="py-2">
                <p><strong>Bezeichnung:</strong> {field.label}</p>
                <p><strong>Schlüssel:</strong> {field.key}</p>
                <p><strong>Typ:</strong> {getFieldTypeLabel(field.type)}</p>
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
                disabled={deleteFieldMutation.isPending || isLoadingField}
              >
                {deleteFieldMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Feld löschen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}