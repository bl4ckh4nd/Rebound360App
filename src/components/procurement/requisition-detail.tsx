import { useParams } from '@tanstack/react-router';
import {
  useRequisition, 
  useSubmitRequisition, 
  useApproveRequisition, 
  useRejectRequisition,
  // useUpdateRequisition, // Keep if needed for draft edits, remove if edit opens form dialog
} from '../../renderer/hooks/useProcurement';
import { useWorkflowByAction } from '../../renderer/hooks/useWorkflow'; // Import workflow hook
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ApprovalHistory } from './approval-history';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { ChevronLeft, File, FileText, MessageSquare, ClipboardCheck, ArrowUpCircle, Check, X, Edit, Loader2 } from 'lucide-react'; // Added Edit, Loader2
import { useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react'; // Added useMemo
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import type { Requisition, RequisitionStatus, RequisitionItem } from '../../shared/types'; // Import specific types
import { RequisitionFormDialog } from './requisition-form-dialog'; // Import Form Dialog
import { RequisitionToPODialog } from './requisition-to-po-dialog'; // Import PO Dialog

// Define ToastProps interface locally if needed
interface LocalToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Default status config (fallback)
const defaultStatusConfig = {
  colors: {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'manager_approval': 'bg-amber-100 text-amber-800',
    'finance_approval': 'bg-purple-100 text-purple-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800',
    'converted': 'bg-indigo-100 text-indigo-800'
  },
  labels: {
    'draft': 'Entwurf',
    'submitted': 'Eingereicht',
    'manager_approval': 'Manager-Freigabe',
    'finance_approval': 'Finanz-Freigabe',
    'approved': 'Genehmigt',
    'rejected': 'Abgelehnt',
    'cancelled': 'Storniert',
    'converted': 'Konvertiert'
  }
};

export function RequisitionDetail() {
  const { requisitionId } = useParams({ from: '/procurement/requisitions/$requisitionId' });
  const { data: requisition, isLoading, error: requisitionError } = useRequisition(requisitionId);
  const { data: workflow } = useWorkflowByAction('procurement-requisition');
  const navigate = useNavigate();
  
  // State for dialogs
  const [actionDialog, setActionDialog] = useState<{ 
    open: boolean; 
    action: 'approve' | 'reject' | null; 
    title?: string; 
    description?: string; 
  }>({ open: false, action: null });
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  // Mutations
  const submitMutation = useSubmitRequisition();
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();
  // const updateDraftMutation = useUpdateRequisition(); // Keep if inline edits are needed

  const { toast } = useToast();

  // Memoize status config
  const statusConfig = useMemo(() => {
    if (workflow?.steps) {
      const colors: Record<string, string> = {};
      const labels: Record<string, string> = {};
      workflow.steps.forEach(step => {
        const statusKey = step.name.toLowerCase();
        const bgColor = `${step.color}20`; 
        const textColor = step.color;
        colors[statusKey] = `bg-[${bgColor}] text-[${textColor}]`; 
        labels[statusKey] = step.name;
      });
      return { colors, labels };
    } else {
      return defaultStatusConfig;
    }
  }, [workflow]);

  if (isLoading) {
    return <div className="p-6 text-center">Lädt Anforderungsdaten...</div>;
  }

  if (requisitionError || !requisition) {
    return (
      <div className="p-6">
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-lg font-medium mb-2">Anforderung nicht gefunden oder Fehler beim Laden</p>
          <p className="text-sm text-red-500 mb-4">{requisitionError?.message}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate({ to: '/procurement/requisitions' })}
          >
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  // --- Helper functions for badges ---
  const getStatusBadge = (status: RequisitionStatus) => {
    const colors = statusConfig.colors as Record<RequisitionStatus, string>;
    const labels = statusConfig.labels as Record<RequisitionStatus, string>;
    const workflowColor = workflow?.steps.find(s => s.name.toLowerCase() === status)?.color;
    return (
      <Badge
        className={colors[status] || defaultStatusConfig.colors['draft']}
        style={ workflowColor ? { backgroundColor: `${workflowColor}20`, color: workflowColor } : {}}
      >
        {labels[status] || status}
      </Badge>
    );
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800',
    };
    
    const priorityLabels: Record<string, string> = {
      low: 'Niedrig',
      normal: 'Normal',
      high: 'Hoch',
    };
    
    return (
      <Badge className={priorityColors[priority] || 'bg-blue-100 text-blue-800'}>
        {priorityLabels[priority] || priority}
      </Badge>
    );
  };

  // Helper function to get type badge
  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      material: 'bg-purple-100 text-purple-800',
      service: 'bg-orange-100 text-orange-800',
      asset: 'bg-indigo-100 text-indigo-800',
    };
    
    const typeLabels: Record<string, string> = {
      material: 'Material',
      service: 'Dienstleistung',
      asset: 'Anlage',
    };
    
    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        {typeLabels[type] || type}
      </Badge>
    );
  };

  // After neededBy date logic
  const isOverdue = requisition.neededBy && new Date(requisition.neededBy) < new Date();
  
  // --- Action Handlers ---
  const handleOpenActionDialog = (action: 'approve' | 'reject') => {
    setActionDialog({
      open: true,
      action,
      title: action === 'approve' ? 'Anforderung genehmigen' : 'Anforderung ablehnen',
      description: action === 'approve' 
        ? 'Möchten Sie diese Anforderung genehmigen? Optional können Sie einen Kommentar hinzufügen.'
        : 'Bitte geben Sie einen Grund für die Ablehnung an.'
    });
  };

  const handleDialogSubmit = async () => {
    if (!actionDialog.action) return;

    const mutation = actionDialog.action === 'approve' ? approveMutation : rejectMutation;
    const args = {
      requisitionId: requisition.id,
      comment: comment.trim(),
      // TODO: Pass actual approver/rejector ID and Name from auth context later
      // approverId: currentUser.id, approverName: currentUser.name,
      // rejectorId: currentUser.id, rejectorName: currentUser.name,
    };

    try {
      await mutation.mutateAsync(args as any); // Use 'as any' to bypass strict arg typing for now
      toast({
        title: actionDialog.action === 'approve' ? "Genehmigt" : "Abgelehnt",
        description: `Die Anforderung wurde erfolgreich ${actionDialog.action === 'approve' ? 'genehmigt' : 'abgelehnt'}.`
      });
      setActionDialog({ open: false, action: null });
      setComment('');
    } catch (error: any) {
      console.error(`Error ${actionDialog.action} requisition:`, error);
      const toastOptions: LocalToastProps = {
        title: "Fehler",
        description: `Aktion fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`,
        variant: 'destructive'
      };
      toast(toastOptions);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await submitMutation.mutateAsync(requisition.id);
      toast({
        title: "Eingereicht",
        description: "Die Anforderung wurde erfolgreich zur Freigabe eingereicht."
      });
    } catch (error: any) {
      console.error('Error submitting requisition:', error);
      const toastOptions: LocalToastProps = {
        title: "Fehler",
        description: `Einreichung fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`,
        variant: 'destructive'
      };
      toast(toastOptions);
    }
  };

  // --- Render Logic ---
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Back Button, Title, Status Badge */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate({ to: '/procurement/requisitions' })}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold">{requisition.title}</h1>
            {getStatusBadge(requisition.status)}
            {isOverdue && (
              <Badge variant="destructive" className="ml-2">
                Überfällig
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* --- DRAFT Actions --- */} 
            {requisition.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button onClick={handleSubmitForApproval} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4 mr-2" />}
                  Einreichen
                </Button>
              </>
            )}

            {/* --- APPROVAL Actions (Submitted, Manager, Finance) --- */} 
            {['submitted', 'manager_approval', 'finance_approval'].includes(requisition.status) && (
              <>
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-700 hover:bg-green-50"
                  onClick={() => handleOpenActionDialog('approve')}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {approveMutation.isPending && approveMutation.variables?.requisitionId === requisition.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Genehmigen
                </Button>
                <Button 
                  variant="destructive" // Changed variant to destructive
                  onClick={() => handleOpenActionDialog('reject')}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {rejectMutation.isPending && rejectMutation.variables?.requisitionId === requisition.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Ablehnen
                </Button>
              </>
            )}

            {/* --- APPROVED Action --- */} 
            {requisition.status === 'approved' && (
              <Button onClick={() => setIsConvertDialogOpen(true)}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                In Bestellung umwandeln
              </Button>
            )}
          </div>
        </div>

        {/* --- Tabs and Content --- */} 
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Artikel</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="comments">Kommentare</TabsTrigger>
            <TabsTrigger value="approvals">Freigabeverlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Informationen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Anforderer</p>
                      <p className="font-medium">{requisition.requesterName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Abteilung</p>
                      <p className="font-medium">{requisition.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priorität</p>
                      <div>{getPriorityBadge(requisition.priority)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Art</p>
                      <div>{getTypeBadge(requisition.procurementType)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Erstellt am</p>
                      <p className="font-medium">{new Date(requisition.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamtbetrag</p>
                      <p className="font-medium">{requisition.totalAmount.toFixed(2)} €</p>
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  <h3 className="text-lg font-medium mb-4">Beschreibung</h3>
                  <p className="whitespace-pre-line">{requisition.description}</p>
                  
                  {requisition.notes && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="text-lg font-medium mb-4">Anmerkungen</h3>
                      <p className="whitespace-pre-line">{requisition.notes}</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Status</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Aktueller Status</p>
                        <div className="mt-1">{getStatusBadge(requisition.status)}</div>
                      </div>
                      
                      {/* Removed Approvers section as requisition.approvers doesn't exist */}
                      {/* {requisition.approvers && requisition.approvers.length > 0 && ( ... )} */}

                    </div>
                  </CardContent>
                </Card>
                
                {/* Other cards (Aktionen, etc.) - Removed redundant actions */}
                {/* <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Aktionen</h3>
                     ... removed PDF export / Add comment buttons ... 
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="items" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Artikel</h3>
                {requisition.items && requisition.items.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Artikel</th>
                        <th className="text-left py-2">Menge</th>
                        <th className="text-left py-2">Einheit</th>
                        <th className="text-right py-2">Einzelpreis</th>
                        <th className="text-right py-2">Gesamtpreis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requisition.items.map((item: RequisitionItem) => { // Added type
                        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
                        const totalPrice = quantity * unitPrice;
                        
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">
                              {/* Changed item.name to item.description */}
                              <div className="font-medium">{item.description || 'Keine Beschreibung'}</div>
                              {/* Optional: Display notes if available */}
                              {item.notes && <div className="text-sm text-muted-foreground">{item.notes}</div>}
                            </td>
                            <td className="py-2">{quantity}</td>
                            <td className="py-2">{item.unit || 'Stk.'}</td>
                            <td className="text-right py-2">{unitPrice.toFixed(2)} €</td>
                            <td className="text-right py-2 font-medium">{totalPrice.toFixed(2)} €</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="text-right py-2 font-medium">Gesamtbetrag:</td>
                        <td className="text-right py-2 font-bold">
                          {(typeof requisition.totalAmount === 'number' ? requisition.totalAmount : 0).toFixed(2)} €
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="text-muted-foreground">Keine Artikel vorhanden</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Dokumente</h3>
                  {/* TODO: Re-enable upload when attachment handling is implemented */}
                  {/* <Button size="sm"> 
                    <File className="w-4 h-4 mr-2" />
                    Dokument hochladen
                  </Button> */}
                </div>
                
                {/* Simplified: Requisition type doesn't currently include documents */}
                <p className="text-muted-foreground">
                  Dokumentenverwaltung ist für Anforderungen derzeit nicht implementiert.
                </p>
                {/* {requisition.documents && requisition.documents.length > 0 ? ( ... ) : ( ... )} */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Kommentare</h3>
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Kommentar hinzufügen
                  </Button>
                </div>
                
                {requisition.comments && requisition.comments.length > 0 ? (
                  <div className="space-y-4">
                    {requisition.comments.map((comment: any) => (
                      <div key={comment.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keine Kommentare vorhanden</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-6">
            <ApprovalHistory requisitionId={requisitionId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Dialogs --- */} 

      {/* Edit Requisition Dialog */} 
      <RequisitionFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={requisition} // Pass current requisition data for editing
      />

      {/* Convert to PO Dialog */} 
      {requisition && (
        <RequisitionToPODialog
          requisitionId={requisition.id}
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
        />
      )}

      {/* Approve/Reject Action Dialog */} 
      <Dialog open={actionDialog.open} onOpenChange={(open) => {
        if (!open) {
          setActionDialog({ open: false, action: null });
          setComment(''); // Clear comment on close
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.title}</DialogTitle>
            <DialogDescription>{actionDialog.description}</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={actionDialog.action === 'reject' ? "Grund für Ablehnung (erforderlich)..." : "Optionaler Kommentar..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]" 
              required={actionDialog.action === 'reject'} // HTML5 required
            />
             {actionDialog.action === 'reject' && !comment.trim() && (
               <p className="text-sm text-red-500 mt-1">Ein Grund für die Ablehnung ist erforderlich.</p>
             )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, action: null })}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleDialogSubmit}
              disabled={
                (actionDialog.action === 'reject' && !comment.trim()) || 
                approveMutation.isPending || 
                rejectMutation.isPending
              }
              variant={actionDialog.action === 'reject' ? "destructive" : "default"}
            >
              {(approveMutation.isPending || rejectMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionDialog.action === 'approve' ? 'Genehmigen' : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}