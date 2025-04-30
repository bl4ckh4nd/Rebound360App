import React from 'react'
import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { TitleBar } from './ui/titlebar'

export function RootLayout() {
  console.log('RootLayout: Rendering root layout component');
  
  React.useEffect(() => {
    console.log('RootLayout: Component mounted');
    return () => console.log('RootLayout: Component unmounted');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto transition-all duration-300">
          <div className="container mx-auto py-6 px-4 md:px-6">
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Outlet />
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}