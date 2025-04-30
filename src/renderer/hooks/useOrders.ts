import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrdersApi } from '../../shared/api/orders-api';
import { ReturnsApi } from '../../shared/api/returns-api';
import type { Order, CreateReturnFromOrderData } from '../../shared/types';

/**
 * Hook for fetching all orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => OrdersApi.getAll(),
  });
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => OrdersApi.getById(id),
    enabled: !!id, // Only run if ID is provided
  });
};

/**
 * Hook for creating a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id'>) => OrdersApi.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Hook for updating an order
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, orderData }: { id: string, orderData: Partial<Order> }) => 
      OrdersApi.update(id, orderData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
};

/**
 * Hook for updating order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: Order['status'] }) => 
      OrdersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
};

/**
 * Hook for creating a return from an order
 */
export const useCreateReturnFromOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReturnFromOrderData) => ReturnsApi.createFromOrder(data),
    onSuccess: (newReturn) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.setQueryData(['return', newReturn.id], newReturn);
    },
    onError: (error) => {
      console.error("Error creating return from order:", error);
    }
  });
};

/**
 * Hook for deleting an order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => OrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};