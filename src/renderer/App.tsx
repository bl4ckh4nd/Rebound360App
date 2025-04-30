import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../components/ui/theme-provider'
import { Toaster } from '../components/ui/sonner'
import { router } from './routes'
import { queryClient } from './query-client'
import React from 'react'

export function App() {
  console.log('App: Rendering application with providers');
  console.log('App: Available routes:', router.routes);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          {/* @ts-ignore -- Type mismatch in TanStack Router types */}
          <RouterProvider router={router} />
          <Toaster position="bottom-right" />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
