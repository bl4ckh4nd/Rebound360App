import { Package, ShoppingBag, Settings, Home, FileText, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useMatches } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

// Define the navigation structure
const routes = [
  { 
    path: '/', 
    icon: Home, 
    name: 'Dashboard'
  },
  { 
    path: '/returns', 
    icon: Package, 
    name: 'Retouren'
  },
  { 
    path: '/procurement', 
    icon: ShoppingBag, 
    name: 'Beschaffung',
    subRoutes: [
      
      { path: '/procurement', name: 'Dashboard' },
      { path: '/procurement/orders', name: 'Bestellungen' },
      { path: '/procurement/requisitions', name: 'Anforderungen' }
    ]
  },
  { 
    path: '/orders', 
    icon: FileText, 
    name: 'Bestellungen (JTL)', 
    description: 'JTL-Wawi Bestellungen' 
  },
  { 
    path: '/suppliers', 
    icon: Building2, 
    name: 'Lieferanten' 
  },
  { 
    path: '/settings', 
    icon: Settings, 
    name: 'Einstellungen' 
  }
];

export function Sidebar() {
  const matches = useMatches();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get the current route path from matches
  const currentPath = matches[matches.length - 1]?.pathname;
  console.log('Sidebar: Current path:', currentPath);

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-white border-r relative transition-all duration-300 flex flex-col`}>
      {/* Logo Section */}
      <div className="p-2 flex items-center justify-center">
        <img 
          src="rebound360_1.png" // Use direct path from public folder
          alt="Rebound360 Logo" 
          className={cn("h-12 transition-all duration-300", isCollapsed ? 'w-12 object-contain' : 'w-auto')}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border shadow-sm bg-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <nav className="p-4 space-y-2 flex-grow">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = currentPath === route.path || 
                          (route.subRoutes?.some(sub => currentPath === sub.path));

          return (
            <div key={route.path}>
              <Link
                to={route.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{route.name}</span>}
              </Link>

              {route.subRoutes && isActive && !isCollapsed && (
                <div className="ml-9 mt-2 space-y-1">
                  {route.subRoutes.map((subRoute) => (
                    <Link
                      key={subRoute.path}
                      to={subRoute.path}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        currentPath === subRoute.path
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {subRoute.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}