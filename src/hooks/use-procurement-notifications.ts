import { useEffect } from 'react';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRequisitions } from '../renderer/hooks/useProcurement';
import type { Requisition } from '../shared/types';

interface NotificationConfig {
  showToasts?: boolean;
  onlyForCurrentUser?: boolean;
  userId?: string;
}

export function useProcurementNotifications(config: NotificationConfig = {}) {
  const { showToasts = true, onlyForCurrentUser = true, userId } = config;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: requisitions = [] } = useRequisitions();

  // Keep track of already notified requisitions to prevent duplicate notifications
  const notifiedRequisitionsRef = new Set<string>();

  useEffect(() => {
    // Filter requisitions based on config
    const pendingRequisitions = requisitions.filter(req => {
      // Skip if we've already notified about this requisition
      if (notifiedRequisitionsRef.has(req.id)) return false;

      // Filter based on user if configured
      if (onlyForCurrentUser && userId && req.currentApprover !== userId) {
        return false;
      }

      // Check if this requisition requires attention
      return needsAttention(req);
    });

    // Process new notifications
    pendingRequisitions.forEach(req => {
      notifiedRequisitionsRef.add(req.id);

      if (showToasts) {
        showNotificationToast(req);
      }

      // Mark requisition as having pending notification
      queryClient.setQueryData(['requisitions'], (oldData: Requisition[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(r => 
          r.id === req.id 
            ? { ...r, hasUnreadNotifications: true }
            : r
        );
      });
    });
  }, [requisitions, showToasts, onlyForCurrentUser, userId, queryClient, toast]);

  return {
    clearNotification: (requisitionId: string) => {
      notifiedRequisitionsRef.delete(requisitionId);
      queryClient.setQueryData(['requisitions'], (oldData: Requisition[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(r => 
          r.id === requisitionId
            ? { ...r, hasUnreadNotifications: false }
            : r
        );
      });
    }
  };
}

function needsAttention(requisition: Requisition): boolean {
  // Define conditions that require attention
  switch (requisition.status) {
    case 'submitted':
      return true; // New submission needs review
    case 'manager_approval':
      return true; // Needs manager approval
    case 'finance_approval':
      return true; // Needs finance approval
    case 'rejected':
      return true; // Rejected requisition needs attention
    default:
      return false;
  }
}

function showNotificationToast(requisition: Requisition) {
  const { toast } = useToast();
  
  let title = '';
  let description = '';

  switch (requisition.status) {
    case 'submitted':
      title = 'Neue Anforderung';
      description = `"${requisition.title}" wartet auf Prüfung`;
      break;
    case 'manager_approval':
      title = 'Genehmigung erforderlich';
      description = `"${requisition.title}" benötigt eine Abteilungsleiter-Genehmigung`;
      break;
    case 'finance_approval':
      title = 'Finanzprüfung erforderlich';
      description = `"${requisition.title}" benötigt eine Finanzgenehmigung`;
      break;
    case 'rejected':
      title = 'Anforderung abgelehnt';
      description = `"${requisition.title}" wurde abgelehnt und benötigt Überarbeitung`;
      break;
  }

  toast({
    title,
    description,
    action: {
      label: 'Anzeigen',
      onClick: () => {
        // Navigation will be handled by the UI component
      }
    }
  });
}