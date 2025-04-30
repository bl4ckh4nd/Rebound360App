import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SyncResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
}

export function useSync() {
  const queryClient = useQueryClient();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      return await window.electron.invoke('test-jtl-connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const syncSuppliersMutation = useMutation({
    mutationFn: async () => {
      return await window.electron.invoke('sync-suppliers') as SyncResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });

  const syncOrdersMutation = useMutation({
    mutationFn: async () => {
      return await window.electron.invoke('sync-orders') as SyncResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      return await window.electron.invoke('sync-all') as SyncResult[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  return {
    testConnection,
    isTestingConnection,
    syncSuppliers: syncSuppliersMutation.mutate,
    isSyncingSuppliers: syncSuppliersMutation.isPending,
    suppliersSyncError: syncSuppliersMutation.error,
    syncOrders: syncOrdersMutation.mutate,
    isSyncingOrders: syncOrdersMutation.isPending,
    ordersSyncError: syncOrdersMutation.error,
    syncAll: syncAllMutation.mutate,
    isSyncingAll: syncAllMutation.isPending,
    allSyncError: syncAllMutation.error
  };
} 