import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowUpCircle, 
  UserCheck, 
  FileText 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type ApprovalHistoryEntry = {
  id: string;
  requisitionId: string;
  timestamp: string;
  status: string;
  actionType: 'create' | 'submit' | 'approve' | 'reject' | 'comment' | 'edit' | 'convert';
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  comment?: string;
  previousStatus?: string;
};

type ApprovalHistoryProps = {
  requisitionId: string;
};

export function ApprovalHistory({ requisitionId }: ApprovalHistoryProps) {
  const { toast } = useToast();
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching approval history
    setIsLoading(true);
    setTimeout(() => {
      // Mock data - in production, this would be a real API call
      const mockData: ApprovalHistoryEntry[] = [
        {
          id: "1",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          status: "draft",
          actionType: "create",
          userId: "1",
          userName: "Anna Schmidt",
          userRole: "Projektmanager",
          userAvatar: "https://i.pravatar.cc/300?u=anna",
          comment: "Anforderung erstellt"
        },
        {
          id: "2",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          status: "submitted",
          actionType: "submit",
          userId: "1",
          userName: "Anna Schmidt",
          userRole: "Projektmanager",
          userAvatar: "https://i.pravatar.cc/300?u=anna",
          previousStatus: "draft",
          comment: "Zur Freigabe eingereicht"
        },
        {
          id: "3",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          status: "manager_approval",
          actionType: "approve",
          userId: "2",
          userName: "Thomas Müller",
          userRole: "Abteilungsleiter",
          userAvatar: "https://i.pravatar.cc/300?u=thomas",
          previousStatus: "submitted",
          comment: "Erste Freigabestufe genehmigt"
        },
        {
          id: "4",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          status: "finance_approval",
          actionType: "comment",
          userId: "3",
          userName: "Maria Weber",
          userRole: "Finanzleitung",
          userAvatar: "https://i.pravatar.cc/300?u=maria",
          previousStatus: "manager_approval",
          comment: "Bitte noch die Kostenstelle präzisieren"
        },
        {
          id: "5",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
          status: "finance_approval",
          actionType: "edit",
          userId: "1",
          userName: "Anna Schmidt",
          userRole: "Projektmanager",
          userAvatar: "https://i.pravatar.cc/300?u=anna",
          comment: "Kostenstelle hinzugefügt: K-2023-005"
        },
        {
          id: "6",
          requisitionId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: "approved",
          actionType: "approve",
          userId: "3",
          userName: "Maria Weber",
          userRole: "Finanzleitung",
          userAvatar: "https://i.pravatar.cc/300?u=maria",
          previousStatus: "finance_approval",
          comment: "Freigegeben"
        }
      ];

      setApprovalHistory(mockData);
      setIsLoading(false);
    }, 500);
  }, [requisitionId]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string, text: string }> = {
      draft: { bg: "bg-gray-100", text: "text-gray-800" },
      submitted: { bg: "bg-amber-100", text: "text-amber-800" },
      manager_approval: { bg: "bg-blue-100", text: "text-blue-800" },
      finance_approval: { bg: "bg-purple-100", text: "text-purple-800" },
      approved: { bg: "bg-green-100", text: "text-green-800" },
      rejected: { bg: "bg-red-100", text: "text-red-800" },
      converted: { bg: "bg-indigo-100", text: "text-indigo-800" }
    };

    const statusLabels: Record<string, string> = {
      draft: "Entwurf",
      submitted: "Eingereicht",
      manager_approval: "Manager-Freigabe",
      finance_approval: "Finanz-Freigabe",
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      converted: "Konvertiert"
    };

    const colors = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
    
    return <Badge className={`${colors.bg} ${colors.text}`}>{statusLabels[status] || status}</Badge>;
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'submit':
        return <ArrowUpCircle className="h-8 w-8 text-amber-500" />;
      case 'approve':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'reject':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'comment':
        return <AlertCircle className="h-8 w-8 text-purple-500" />;
      case 'edit':
        return <FileText className="h-8 w-8 text-gray-500" />;
      case 'convert':
        return <UserCheck className="h-8 w-8 text-indigo-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Lade Freigabeverlauf...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (approvalHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Kein Freigabeverlauf gefunden</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const exportHistory = () => {
    toast({
      title: "Export gestartet",
      description: "Der Freigabeverlauf wird als PDF exportiert.",
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Freigabeverlauf</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={exportHistory}>PDF Export</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Freigabeverlauf als PDF exportieren</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-6">
          {approvalHistory.map((entry, index) => (
            <div key={entry.id} className="relative">
              {index !== 0 && (
                <div className="absolute left-4 top-0 h-full w-px bg-border -translate-x-1/2" />
              )}
              
              <div className="flex gap-4">
                <div className="mt-1 relative z-10 bg-background">
                  {getActionIcon(entry.actionType)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={entry.userAvatar} alt={entry.userName} />
                        <AvatarFallback>{entry.userName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.userName}</span>
                      <span className="text-sm text-muted-foreground">({entry.userRole})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  
                  <div className="mb-1">
                    {getStatusBadge(entry.status)}
                    {entry.previousStatus && (
                      <span className="text-sm text-muted-foreground ml-2">
                        von {getStatusBadge(entry.previousStatus)}
                      </span>
                    )}
                  </div>
                  
                  {entry.comment && (
                    <p className="text-sm mt-1">{entry.comment}</p>
                  )}
                </div>
              </div>
              
              {index !== approvalHistory.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}