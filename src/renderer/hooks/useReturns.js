"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAddReturnNote = exports.useUpdateReturn = exports.useReturns = exports.useReturn = exports.useDeleteDocument = exports.useUploadDocument = exports.useReturnDocuments = exports.useDeleteDraftReturn = exports.useUpdateDraftReturn = exports.useCreateDraftReturn = exports.FileTypeError = exports.FileSizeError = void 0;
const react_query_1 = require("@tanstack/react-query");
const returns_api_1 = require("../../shared/api/returns-api");
const api_client_1 = require("../../shared/api/api-client");
const document_utils_1 = require("../../shared/api/document-utils");
// Constants for file upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
];
// Error classes for better error handling
class FileSizeError extends Error {
    constructor(fileSize) {
        super(`File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        this.name = 'FileSizeError';
    }
}
exports.FileSizeError = FileSizeError;
class FileTypeError extends Error {
    constructor(fileType) {
        super(`File type ${fileType} not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
        this.name = 'FileTypeError';
    }
}
exports.FileTypeError = FileTypeError;
/**
 * Hook for creating a draft return
 */
const useCreateDraftReturn = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: () => returns_api_1.ReturnsApi.createDraft(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.setQueryData(['return', data.id], data);
        },
    });
};
exports.useCreateDraftReturn = useCreateDraftReturn;
/**
 * Hook for updating a draft return
 */
const useUpdateDraftReturn = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, returnData }) => returns_api_1.ReturnsApi.updateDraft(id, returnData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.setQueryData(['return', data.id], data);
        },
    });
};
exports.useUpdateDraftReturn = useUpdateDraftReturn;
/**
 * Hook for deleting a draft return
 */
const useDeleteDraftReturn = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (id) => returns_api_1.ReturnsApi.deleteDraft(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.removeQueries({ queryKey: ['return', variables] });
        },
    });
};
exports.useDeleteDraftReturn = useDeleteDraftReturn;
/**
 * Hook for getting all documents for a return
 */
const useReturnDocuments = (returnId) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['return', returnId, 'documents'],
        queryFn: () => returns_api_1.ReturnsApi.getDocuments(returnId),
        enabled: !!returnId,
    });
};
exports.useReturnDocuments = useReturnDocuments;
/**
 * Hook for uploading a document to a return with improved validation and optimistic updates
 */
const useUploadDocument = (returnId, apiUrl) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ file, description }) => {
            // Validate file before upload
            (0, document_utils_1.validateFile)(file);
            // Create a custom API client with the provided URL if one is supplied
            if (apiUrl) {
                const customApiClient = new api_client_1.ApiClient(`${apiUrl}/api`);
                return customApiClient.uploadFile(`/returns/${returnId}/documents`, (() => {
                    const formData = new FormData();
                    formData.append('file', file);
                    if (description) {
                        formData.append('description', description);
                    }
                    return formData;
                })());
            }
            // Otherwise use the default client
            return returns_api_1.ReturnsApi.uploadDocument(returnId, file, description);
        },
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['return', returnId, 'documents'] });
            // Get current documents
            const previousDocs = queryClient.getQueryData(['return', returnId, 'documents']);
            // Create optimistic document
            const optimisticDoc = {
                id: `temp-${Date.now()}`,
                returnId,
                fileName: variables.file.name,
                fileType: variables.file.type,
                fileSize: variables.file.size,
                filePath: '', // Will be updated with real path
                description: variables.description,
                uploadDate: new Date().toISOString()
            };
            // Optimistically update documents list
            queryClient.setQueryData(['return', returnId, 'documents'], (old = []) => [...old, optimisticDoc]);
            // Also update the return data if it exists in cache
            queryClient.setQueryData(['return', returnId], (oldReturn) => {
                if (!oldReturn)
                    return oldReturn;
                return {
                    ...oldReturn,
                    documents: [...(oldReturn.documents || []), optimisticDoc]
                };
            });
            return { previousDocs };
        },
        onError: (err, variables, context) => {
            // Show user-friendly error message
            console.error('Error uploading document:', err);
            // Revert optimistic updates
            if (context?.previousDocs) {
                queryClient.setQueryData(['return', returnId, 'documents'], context.previousDocs);
                // Also revert the return data
                queryClient.setQueryData(['return', returnId], (oldReturn) => {
                    if (!oldReturn)
                        return oldReturn;
                    return {
                        ...oldReturn,
                        documents: context.previousDocs
                    };
                });
            }
        },
        onSuccess: (data) => {
            // Update queries with the real data
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['return', returnId] });
            queryClient.invalidateQueries({ queryKey: ['return', returnId, 'documents'] });
        }
    });
};
exports.useUploadDocument = useUploadDocument;
/**
 * Hook for deleting a document
 */
const useDeleteDocument = (returnId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (documentId) => returns_api_1.ReturnsApi.deleteDocument(returnId, documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['return', returnId, 'documents'] });
        },
    });
};
exports.useDeleteDocument = useDeleteDocument;
/**
 * Hook for getting a single return by ID
 */
const useReturn = (id) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['return', id],
        queryFn: () => returns_api_1.ReturnsApi.getById(id),
        enabled: !!id,
    });
};
exports.useReturn = useReturn;
/**
 * Hook for getting all returns
 */
const useReturns = () => {
    return (0, react_query_1.useQuery)({
        queryKey: ['returns'],
        queryFn: () => returns_api_1.ReturnsApi.getAll(),
    });
};
exports.useReturns = useReturns;
/**
 * Hook for updating a return
 */
const useUpdateReturn = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, returnData }) => returns_api_1.ReturnsApi.update(id, returnData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.setQueryData(['return', data.id], data);
        },
    });
};
exports.useUpdateReturn = useUpdateReturn;
/**
 * Hook for adding a note to a return
 */
const useAddReturnNote = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, content, author }) => returns_api_1.ReturnsApi.addNote(id, content, author),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['return', variables.id] });
        },
    });
};
exports.useAddReturnNote = useAddReturnNote;
//# sourceMappingURL=useReturns.js.map