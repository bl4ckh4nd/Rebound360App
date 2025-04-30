import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { 
  useCategories, 
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReasons,
  useReason,
  useCreateReason,
  useUpdateReason,
  useDeleteReason
} from '../../renderer/hooks/useSettings'
import { FollowUpAction, ReasonCategory, ReturnReason } from '../../shared/types'
import { Loader2, Plus, Trash2, Edit, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function ReasonSettings() {
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: reasons, isLoading: isLoadingReasons } = useReasons()
  const [selectedTab, setSelectedTab] = useState<string>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null)
  
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  
  const [isCreateReasonDialogOpen, setIsCreateReasonDialogOpen] = useState(false)
  const [isEditReasonDialogOpen, setIsEditReasonDialogOpen] = useState(false)
  const [isDeleteReasonDialogOpen, setIsDeleteReasonDialogOpen] = useState(false)
  
  const isLoading = isLoadingCategories || isLoadingReasons
  
  if (isLoading) {
    return <div className="flex justify-center p-6"><Loader2 className="animate-spin h-8 w-8" /></div>
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="reasons">Rückgabegründe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Rückgabekategorien</h2>
            <Button onClick={() => setIsCreateCategoryDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Kategorie
            </Button>
          </div>
          
          <div className="mt-4 grid gap-4">
            {categories?.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category}
                reasonCount={
                  reasons?.filter(reason => reason.categoryId === category.id).length || 0
                }
                onEdit={() => {
                  setSelectedCategoryId(category.id);
                  setIsEditCategoryDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedCategoryId(category.id);
                  setIsDeleteCategoryDialogOpen(true);
                }}
              />
            ))}
            
            {categories?.length === 0 && (
              <div className="text-center p-6 border rounded-md border-dashed">
                <p className="text-muted-foreground">Keine Kategorien gefunden</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setIsCreateCategoryDialogOpen(true)}>
                  <Plus className="mr-1 h-3 w-3" /> Kategorie erstellen
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reasons">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Rückgabegründe</h2>
            <Button 
              onClick={() => setIsCreateReasonDialogOpen(true)}
              disabled={categories?.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Neuer Grund
            </Button>
          </div>
          
          {categories?.length === 0 ? (
            <div className="text-center p-6 border rounded-md border-dashed mt-4">
              <p className="text-muted-foreground">Erstellen Sie zuerst eine Kategorie</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => {
                setSelectedTab('categories');
                setIsCreateCategoryDialogOpen(true);
              }}>
                <Plus className="mr-1 h-3 w-3" /> Kategorie erstellen
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {categories?.map((category) => {
                const categoryReasons = reasons?.filter(reason => reason.categoryId === category.id) || [];
                
                if (categoryReasons.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-6">
                    <h3 className="font-medium text-md mb-2">{category.name}</h3>
                    <div className="grid gap-3">
                      {categoryReasons.map((reason) => (
                        <ReasonCard 
                          key={reason.id} 
                          reason={reason}
                          onEdit={() => {
                            setSelectedReasonId(reason.id);
                            setIsEditReasonDialogOpen(true);
                          }}
                          onDelete={() => {
                            setSelectedReasonId(reason.id);
                            setIsDeleteReasonDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {reasons?.length === 0 && (
                <div className="text-center p-6 border rounded-md border-dashed">
                  <p className="text-muted-foreground">Keine Gründe gefunden</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setIsCreateReasonDialogOpen(true)}>
                    <Plus className="mr-1 h-3 w-3" /> Grund erstellen
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Category Dialogs */}
      <CategoryDialog
        mode="create"
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
      />
      
      {selectedCategoryId && (
        <>
          <CategoryDialog
            mode="edit"
            categoryId={selectedCategoryId}
            open={isEditCategoryDialogOpen}
            onOpenChange={setIsEditCategoryDialogOpen}
          />
          
          <DeleteCategoryDialog
            categoryId={selectedCategoryId}
            open={isDeleteCategoryDialogOpen}
            onOpenChange={setIsDeleteCategoryDialogOpen}
          />
        </>
      )}
      
      {/* Reason Dialogs */}
      <ReasonDialog
        mode="create"
        open={isCreateReasonDialogOpen}
        onOpenChange={setIsCreateReasonDialogOpen}
        categories={categories || []}
      />
      
      {selectedReasonId && (
        <>
          <ReasonDialog
            mode="edit"
            reasonId={selectedReasonId}
            open={isEditReasonDialogOpen}
            onOpenChange={setIsEditReasonDialogOpen}
            categories={categories || []}
          />
          
          <DeleteReasonDialog
            reasonId={selectedReasonId}
            open={isDeleteReasonDialogOpen}
            onOpenChange={setIsDeleteReasonDialogOpen}
          />
        </>
      )}
    </div>
  )
}

// Individual components
interface CategoryCardProps {
  category: ReasonCategory
  reasonCount: number
  onEdit: () => void
  onDelete: () => void
}

function CategoryCard({ category, reasonCount, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {reasonCount} {reasonCount === 1 ? 'Grund' : 'Gründe'}
          </p>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600" disabled={reasonCount > 0}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Trash2 className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                {reasonCount > 0 && (
                  <TooltipContent>
                    <p>Kategorie kann nicht gelöscht werden, da sie Gründe enthält</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ReasonCardProps {
  reason: ReturnReason
  onEdit: () => void
  onDelete: () => void
}

function ReasonCard({ reason, onEdit, onDelete }: ReasonCardProps) {
  return (
    <div className={`border rounded-lg p-4 shadow-sm ${!reason.isActive ? 'opacity-60' : ''}`}>
      <div className="flex justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{reason.name}</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {reason.code}
            </span>
            {!reason.isActive && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                Inaktiv
              </span>
            )}
          </div>
          
          {reason.description && (
            <p className="text-sm text-muted-foreground mt-1">{reason.description}</p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-1">
            {reason.applicableActions.map(action => (
              <span key={action} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {getActionName(action)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface CategoryDialogProps {
  mode: 'create' | 'edit'
  categoryId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CategoryDialog({ mode, categoryId, open, onOpenChange }: CategoryDialogProps) {
  const { data: category, isLoading: isLoadingCategory } = useCategory(
    mode === 'edit' ? categoryId : undefined
  )
  
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory(
    mode === 'edit' ? categoryId : undefined
  )
  
  const [formData, setFormData] = useState<Omit<ReasonCategory, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    order: 0
  })
  
  React.useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        order: category.order
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        order: 0
      })
    }
  }, [mode, category, open])
  
  const handleSubmit = () => {
    if (mode === 'create') {
      createCategory(formData, {
        onSuccess: () => onOpenChange(false)
      })
    } else if (mode === 'edit' && categoryId) {
      updateCategory(formData, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }))
  }
  
  const isLoading = (mode === 'edit' && isLoadingCategory) || isCreating || isUpdating
  const isSubmitDisabled = isLoading || !formData.name
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neue Kategorie erstellen' : 'Kategorie bearbeiten'}
          </DialogTitle>
          <DialogDescription>
            Erstellen oder bearbeiten Sie eine Kategorie für Rückgabegründe
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingCategory ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="z.B. Qualitätsprobleme"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Optionale Beschreibung der Kategorie"
                  rows={3}
                />
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
                {mode === 'create' ? 'Kategorie erstellen' : 'Änderungen speichern'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DeleteCategoryDialogProps {
  categoryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DeleteCategoryDialog({ categoryId, open, onOpenChange }: DeleteCategoryDialogProps) {
  const { data: category, isLoading: isLoadingCategory } = useCategory(categoryId)
  const { data: reasons } = useReasons()
  const { mutate: deleteCategory, isPending: isDeleting, error } = useDeleteCategory()
  
  const reasonsInCategory = reasons?.filter(reason => reason.categoryId === categoryId) || []
  const canDelete = reasonsInCategory.length === 0
  
  const handleDelete = () => {
    if (canDelete) {
      deleteCategory(categoryId, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategorie löschen</DialogTitle>
          <DialogDescription>
            {canDelete 
              ? 'Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
              : 'Diese Kategorie kann nicht gelöscht werden, da sie noch Gründe enthält.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingCategory ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            {category && (
              <div className="py-2">
                <p><strong>Name:</strong> {category.name}</p>
                {category.description && (
                  <p><strong>Beschreibung:</strong> {category.description}</p>
                )}
                {!canDelete && (
                  <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-md flex items-center">
                    <Info className="h-4 w-4 mr-2" /> 
                    Diese Kategorie enthält {reasonsInCategory.length} Gründe. Bitte löschen oder verschieben Sie diese Gründe zuerst.
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-2 rounded-md">
                {error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten'}
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
                disabled={!canDelete || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kategorie löschen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ReasonDialogProps {
  mode: 'create' | 'edit'
  reasonId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ReasonCategory[]
}

function ReasonDialog({ mode, reasonId, open, onOpenChange, categories }: ReasonDialogProps) {
  const { data: reason, isLoading: isLoadingReason } = useReason(
    mode === 'edit' ? reasonId : undefined
  )
  
  const { mutate: createReason, isPending: isCreating } = useCreateReason()
  const { mutate: updateReason, isPending: isUpdating } = useUpdateReason(
    mode === 'edit' ? reasonId : undefined
  )
  
  const [formData, setFormData] = useState<Omit<ReturnReason, 'id' | 'createdAt' | 'updatedAt'>>({
    code: '',
    name: '',
    description: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    isActive: true,
    applicableActions: []
  })
  
  React.useEffect(() => {
    if (mode === 'edit' && reason) {
      setFormData({
        code: reason.code,
        name: reason.name,
        description: reason.description || '',
        categoryId: reason.categoryId,
        isActive: reason.isActive,
        applicableActions: reason.applicableActions
      })
    } else if (mode === 'create') {
      setFormData({
        code: '',
        name: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        isActive: true,
        applicableActions: []
      })
    }
  }, [mode, reason, categories, open])
  
  const handleSubmit = () => {
    if (mode === 'create') {
      createReason(formData, {
        onSuccess: () => onOpenChange(false)
      })
    } else if (mode === 'edit' && reasonId) {
      updateReason(formData, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const toggleActive = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }))
  }
  
  const toggleAction = (action: FollowUpAction, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, applicableActions: [...prev.applicableActions, action] }
      } else {
        return { ...prev, applicableActions: prev.applicableActions.filter(a => a !== action) }
      }
    })
  }
  
  const actions: FollowUpAction[] = ['gutschrift', 'ersatz', 'reparatur', 'ausschuss']
  
  const isLoading = (mode === 'edit' && isLoadingReason) || isCreating || isUpdating
  const isSubmitDisabled = isLoading || !formData.name || !formData.code || !formData.categoryId || formData.applicableActions.length === 0
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neuen Rückgabegrund erstellen' : 'Rückgabegrund bearbeiten'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Erstellen Sie einen neuen Rückgabegrund' : 'Bearbeiten Sie den ausgewählten Rückgabegrund'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingReason ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="z.B. QM-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kategorie *</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="z.B. Produktionsabweichung"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optionale Beschreibung des Grundes"
                  rows={2}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Anwendbar für Folgeaktionen *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map(action => (
                    <div key={action} className="flex items-center space-x-2">
                      <Checkbox
                        id={`action-${action}`}
                        checked={formData.applicableActions.includes(action)}
                        onCheckedChange={(checked) => toggleAction(action, !!checked)}
                      />
                      <Label htmlFor={`action-${action}`}>{getActionName(action)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={toggleActive}
                />
                <Label htmlFor="isActive">Aktiv</Label>
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
                {mode === 'create' ? 'Grund erstellen' : 'Änderungen speichern'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DeleteReasonDialogProps {
  reasonId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DeleteReasonDialog({ reasonId, open, onOpenChange }: DeleteReasonDialogProps) {
  const { data: reason, isLoading: isLoadingReason } = useReason(reasonId)
  const { mutate: deleteReason, isPending: isDeleting } = useDeleteReason()
  
  const handleDelete = () => {
    deleteReason(reasonId, {
      onSuccess: () => onOpenChange(false)
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rückgabegrund löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie diesen Rückgabegrund löschen möchten?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingReason ? (
          <div className="flex justify-center p-6">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            {reason && (
              <div className="py-2">
                <p><strong>Code:</strong> {reason.code}</p>
                <p><strong>Name:</strong> {reason.name}</p>
                {reason.description && (
                  <p><strong>Beschreibung:</strong> {reason.description}</p>
                )}
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
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grund löschen
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
    default:
      return action;
  }
}