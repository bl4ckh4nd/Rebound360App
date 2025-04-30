import { Outlet, Link, useMatches } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

export function ProcurementLayout() {
  const matches = useMatches()
  
  const routes = [
    { path: '/procurement', name: 'Dashboard' },
    { path: '/procurement/orders', name: 'Bestellungen', matchPattern: /^\/procurement\/orders(?:\/|$)/ },
    { path: '/procurement/requisitions', name: 'Anforderungen', matchPattern: /^\/procurement\/requisitions(?:\/|$)/ }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Beschaffung</h1>
        <div className="flex items-center gap-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path as any}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                route.matchPattern ? 
                  matches.some(match => route.matchPattern?.test(match.pathname)) ?
                  'bg-primary text-primary-foreground' :
                  'text-foreground/70 hover:bg-secondary hover:text-foreground' :
                  matches.some(match => match.pathname === route.path) ?
                  'bg-primary text-primary-foreground' :
                  'text-foreground/70 hover:bg-secondary hover:text-foreground'
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