import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierApi } from '../../shared/api/supplier-api';
import type { Supplier } from '../../shared/types';

export function useSuppliers(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => SupplierApi.getSuppliers(filters),
    select: (response) => response || [] // Ensure we always return an array, even if empty
  });
}

export function useSupplier(id?: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => id ? SupplierApi.getSupplierById(id) : null,
    enabled: !!id
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) =>
      SupplierApi.createSupplier(supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (supplier: Supplier) => SupplierApi.updateSupplier(supplier),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
    }
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SupplierApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
}