import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../query-client';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application with React Query's QueryClientProvider
 * and optionally includes the React Query DevTools in development mode
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};