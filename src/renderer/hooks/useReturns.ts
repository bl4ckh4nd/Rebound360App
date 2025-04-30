import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReturnsApi } from '../../shared/api/returns-api';
import type { ReturnItem, Document } from '../../shared/types';
import { ApiClient } from '../../shared/api/api-client';

/**
 * Hook for creating a draft return
 */
export const useCreateDraftReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => ReturnsApi.createDraft(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.setQueryData(['return', data.id], data);
    },
  });
};

/**
 * Hook for updating a draft return
 */
export const useUpdateDraftReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, returnData }: { id: string, returnData: Partial<ReturnItem> }) => 
      ReturnsApi.updateDraft(id, returnData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.setQueryData(['return', data.id], data);
    },
  });
};

/**
 * Hook for deleting a draft return
 */
export const useDeleteDraftReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ReturnsApi.deleteDraft(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.removeQueries({ queryKey: ['return', variables] });
    },
  });
};

/**
 * Hook for getting all documents for a return
 */
export const useReturnDocuments = (returnId: string) => {
  return useQuery({
    queryKey: ['return', returnId, 'documents'],
    queryFn: () => ReturnsApi.getDocuments(returnId),
    enabled: !!returnId,
  });
};

/**
 * Hook for uploading a document to a return
 */
export const useUploadDocument = (returnId: string, apiUrl?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, description }: { file: File, description?: string }) => {
      // Create a custom API client with the provided URL if one is supplied
      if (apiUrl) {
        const customApiClient = new ApiClient(`${apiUrl}/api`);
        return customApiClient.uploadFile<Document>(`/returns/${returnId}/documents`, (() => {
          const formData = new FormData();
          formData.append('file', file);
          if (description) {
            formData.append('description', description);
          }
          return formData;
        })());
      }
      // Otherwise use the default client
      return ReturnsApi.uploadDocument(returnId, file, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['return', returnId, 'documents'] });
    },
  });
};

/**
 * Hook for deleting a document
 */
export const useDeleteDocument = (returnId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (documentId: string) => ReturnsApi.deleteDocument(returnId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['return', returnId, 'documents'] });
    },
  });
};

/**
 * Hook for getting a single return by ID
 */
export const useReturn = (id: string) => {
  return useQuery({
    queryKey: ['return', id],
    queryFn: () => ReturnsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook for getting all returns
 */
export const useReturns = () => {
  return useQuery({
    queryKey: ['returns'],
    queryFn: () => ReturnsApi.getAll(),
  });
};

/**
 * Hook for updating a return
 */
export const useUpdateReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, returnData }: { id: string, returnData: Partial<ReturnItem> }) => 
      ReturnsApi.update(id, returnData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.setQueryData(['return', data.id], data);
    },
  });
};

/**
 * Hook for deleting a return
 */
export const useDeleteReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ReturnsApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate the list of returns
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      // Optionally remove the specific return from the cache
      queryClient.removeQueries({ queryKey: ['return', id] });
    },
  });
};

/**
 * Hook for adding a note to a return
 */
export const useAddReturnNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, content, author }: { id: string, content: string, author: string }) => 
      ReturnsApi.addNote(id, content, author),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['return', variables.id] });
    },
  });
};
