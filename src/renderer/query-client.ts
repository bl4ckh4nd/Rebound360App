import { QueryClient } from '@tanstack/react-query';

/**
 * Configure and export the React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'development',
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Retry failed requests 3 times
      retry: 3,
      // Show retries with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations twice
      retry: 2,
      // Use exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});