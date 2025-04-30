import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Requisition, PurchaseOrder, RequisitionStatus, Address } from '../../shared/types';
import { ProcurementApi } from '../../shared/api/procurement-api';

// Requisition hooks
export function useRequisitions(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['requisitions', filters],
    queryFn: () => ProcurementApi.getRequisitions(filters)
  });
}

export function useRequisition(id?: string) {
  return useQuery({
    queryKey: ['requisition', id],
    queryFn: () => id ? ProcurementApi.getRequisitionById(id) : null,
    enabled: !!id
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) =>
      ProcurementApi.createRequisition(requisition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

export function useUpdateRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation<Requisition, Error, Requisition>({
    mutationFn: (requisition: Requisition) =>
      ProcurementApi.updateRequisition(requisition),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['requisition', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

export function useDeleteRequisitions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => ProcurementApi.deleteRequisition(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

// Purchase Order hooks
export function usePurchaseOrders(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => ProcurementApi.getPurchaseOrders(filters)
  });
}

export function usePurchaseOrder(id?: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => id ? ProcurementApi.getPurchaseOrderById(id) : null,
    enabled: !!id
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) =>
      ProcurementApi.createPurchaseOrder(purchaseOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (purchaseOrder: PurchaseOrder) =>
      ProcurementApi.updatePurchaseOrder(purchaseOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', variables.id] });
    }
  });
}

export function useDeletePurchaseOrders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => ProcurementApi.deletePurchaseOrder(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }
  });
}

// Workflow action hooks
export function useSubmitRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation<Requisition, Error, string>({
    mutationFn: (requisitionId: string) => {
      return ProcurementApi.submitRequisition(requisitionId);
    },
    onSuccess: (data, requisitionId) => {
      queryClient.setQueryData(['requisition', requisitionId], data);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

interface ApproveArgs {
  requisitionId: string;
  comment?: string;
  approverId?: string;
  approverName?: string;
}

export function useApproveRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation<Requisition, Error, ApproveArgs>({
    mutationFn: (args: ApproveArgs) => {
      return ProcurementApi.approveRequisition(args);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['requisition', variables.requisitionId], data);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

interface RejectArgs {
  requisitionId: string;
  comment: string;
  rejectorId?: string;
  rejectorName?: string;
}

export function useRejectRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation<Requisition, Error, RejectArgs>({
    mutationFn: (args: RejectArgs) => {
      if (!args.comment?.trim()) {
        return Promise.reject(new Error('Rejection comment is required.'));
      }
      return ProcurementApi.rejectRequisition(args);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['requisition', variables.requisitionId], data);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    }
  });
}

interface ConvertArgs {
  requisitionId: string;
  // Explicitly define the expected structure inline for now to satisfy linter
  // This should ideally match the Address type defined in shared/types.ts
  billingAddress: { name: string; street: string; zipCode: string; city: string; country: string; };
  shippingAddress: { name: string; street: string; zipCode: string; city: string; country: string; };
}

export function useConvertToPurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation<PurchaseOrder, Error, ConvertArgs>({
    mutationFn: (args: ConvertArgs) =>
      ProcurementApi.convertToPurchaseOrder(args.requisitionId, {
        billingAddress: args.billingAddress,
        shippingAddress: args.shippingAddress
      }),
    onSuccess: (poData, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
    }
  });
}
