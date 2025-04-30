import { Outlet, Link, useMatches } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export function ReturnsLayout() {
  const matches = useMatches()
  
  const routes = [
    { path: '/returns/table', name: 'Tabellenansicht' },
    { path: '/returns/list', name: 'Listenansicht' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Retouren</h1>
        <div className="flex items-center gap-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path as any}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                matches.some(match => match.pathname === route.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`}
            >
              {route.name}
            </Link>
          ))}
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  )
}