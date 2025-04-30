import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  FileText, 
  Users, 
  Check, 
  List, 
  Plus,
  Settings,
  Building2,
  FilePlus
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useReturns } from '../renderer/hooks/useReturns.ts';
import { useOrders } from '../renderer/hooks/useOrders';
import { useRequisitions } from '../renderer/hooks/useProcurement';
import { usePurchaseOrders } from '../renderer/hooks/useProcurement';
import { useSuppliers } from '../renderer/hooks/useSuppliers';
import type { ReturnItem, Order, Requisition, PurchaseOrder, Supplier } from '../shared/types';
import { StatCard } from './ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge'; // Import Badge for status indicators
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Separator } from './ui/separator';

// Helper function to format relative time
const formatRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return 'Unbekannt';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Ungültiges Datum';
  }
};

// Helper to get status badge variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" => {
  switch (status?.toLowerCase()) {
    case 'genehmigt':
    case 'geliefert':
    case 'completed':
    case 'active':
    case 'abgeschlossen':
    case 'gutgeschrieben':
      return 'success';
    case 'ausstehend':
    case 'bestellt':
    case 'submitted':
    case 'manager_approval':
    case 'finance_approval':
    case 'pending': // Generic pending
    case 'beauftragt':
    case 'versandt':
      return 'warning';
    case 'rejected':
    case 'storniert':
    case 'inactive':
    case 'ausschuss':
      return 'destructive';
    case 'teilgeliefert':
    case 'processing': // Generic processing
      return 'info';
    default:
      return 'secondary';
  }
};

// Add this explicit type for casting Badge variant
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | null | undefined;

// Mapping for user-friendly status labels
const statusLabels: Record<string, string> = {
  // Return Statuses
  'ausstehend': 'Ausstehend',
  'beauftragt': 'Beauftragt',
  'versandt': 'Versandt',
  'abgeschlossen': 'Abgeschlossen',
  'gutgeschrieben': 'Gutgeschrieben',
  // Order Statuses
  'bestellt': 'Bestellt',
  'geliefert': 'Geliefert',
  'teilgeliefert': 'Teilgeliefert',
  'storniert': 'Storniert',
  // Requisition Statuses
  'draft': 'Entwurf',
  'submitted': 'Eingereicht',
  'manager_approval': 'Manager-Freigabe',
  'finance_approval': 'Finanz-Freigabe',
  'approved': 'Genehmigt',
  'rejected': 'Abgelehnt',
  'ordered': 'Bestellt', // If req links to PO
  // Purchase Order Statuses
  'pending': 'Ausstehend',
  'processing': 'In Bearbeitung',
  'shipped': 'Versandt',
  'partially_received': 'Teilw. erhalten',
  'received': 'Erhalten',
  'completed': 'Abgeschlossen',
  'cancelled': 'Storniert',
  // Supplier Statuses
  'active': 'Aktiv',
  'inactive': 'Inaktiv',
};

const getStatusLabel = (status: string | undefined): string => {
  return status ? (statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)) : 'N/A';
}

export function Dashboard() {
  const navigate = useNavigate();

  // Fetch data using hooks
  const { data: returns = [], isLoading: isLoadingReturns } = useReturns();
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const { data: requisitions = [], isLoading: isLoadingRequisitions } = useRequisitions();
  const { data: purchaseOrders = [], isLoading: isLoadingPO } = usePurchaseOrders();
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers();

  const isLoading = isLoadingReturns || isLoadingOrders || isLoadingRequisitions || isLoadingPO || isLoadingSuppliers;

  // Calculate statistics
  const pendingReturns = returns.filter((item: ReturnItem) => ['ausstehend', 'beauftragt'].includes(item.status)).length;
  const openCreditNotes = returns.filter((item: ReturnItem) => item.followUpAction === 'gutschrift' && item.status !== 'gutgeschrieben' && item.status !== 'abgeschlossen').length;
  const pendingApprovals = requisitions.filter((req: Requisition) => ['submitted', 'manager_approval', 'finance_approval'].includes(req.status)).length;
  const activePurchaseOrders = purchaseOrders.filter((po: PurchaseOrder) => !['completed', 'cancelled', 'received'].includes(po.status)).length; // More specific active statuses
  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 'active').length;
  const recentJtlOrders = orders.filter((o: Order) => ['geliefert', 'teilgeliefert'].includes(o.status)).length; // Assuming these might need returns

  // Get recent items
  const recentReturns = [...returns]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4); // Limit for better card display

  const recentPOrders = [...purchaseOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4); // Limit for better card display

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-background text-foreground">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
             {format(new Date(), "'Heute ist' EEEE, d. MMMM yyyy", { locale: de })}
          </p>
        </div>
         {/* Moved create buttons to a dedicated card below */}
      </div>

      {/* Key Stats Overview - Made links explicit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* StatCard for Pending Returns */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Offene Retouren</CardTitle>
               <Package className="h-4 w-4 text-yellow-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{pendingReturns}</div>
               <p className="text-xs text-muted-foreground">Warten auf Bearbeitung</p>
             </CardContent>
             <CardFooter>
               {/* Corrected navigation path */}
               <Button variant="link" size="sm" className="p-0 h-auto text-yellow-600" onClick={() => navigate({ to: '/returns'})}>Details anzeigen</Button>
             </CardFooter>
           </Card>

         {/* StatCard for Open Credit Notes */}
         <Card className="shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Offene Gutschriften</CardTitle>
               <CreditCard className="h-4 w-4 text-blue-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{openCreditNotes}</div>
               <p className="text-xs text-muted-foreground">Aus Follow-Up 'Gutschrift'</p>
             </CardContent>
             <CardFooter>
                {/* Corrected navigation path and search params */}
                <Button variant="link" size="sm" className="p-0 h-auto text-blue-600" onClick={() => navigate({ to: '/returns', search: { status: 'gutschrift' }})}>Details anzeigen</Button>
             </CardFooter>
           </Card>

         {/* StatCard for Pending Approvals */}
         <Card className="shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Aussteh. Freigaben</CardTitle>
               <FileText className="h-4 w-4 text-red-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{pendingApprovals}</div>
               <p className="text-xs text-muted-foreground">Anforderungen zur Prüfung</p>
             </CardContent>
             <CardFooter>
               <Button variant="link" size="sm" className="p-0 h-auto text-red-600" onClick={() => navigate({ to: '/procurement/approvals'})}>Details anzeigen</Button>
             </CardFooter>
           </Card>

         {/* StatCard for Active POs */}
         <Card className="shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Aktive Bestellungen</CardTitle>
               <ShoppingCart className="h-4 w-4 text-green-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{activePurchaseOrders}</div>
               <p className="text-xs text-muted-foreground">Laufende Beschaffung</p>
             </CardContent>
             <CardFooter>
               <Button variant="link" size="sm" className="p-0 h-auto text-green-600" onClick={() => navigate({ to: '/procurement/orders'})}>Details anzeigen</Button>
             </CardFooter>
           </Card>
      </div>

      {/* Recent Activities & Quick Actions in a new grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Returns Card (takes more space potentially) */}
        <Card className="lg:col-span-1 flex flex-col shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold">Neueste Retouren</CardTitle>
            {/* Corrected navigation path for 'Alle' link */}
            <Link to="/returns" className="text-sm text-primary hover:underline flex items-center gap-1">
              Alle <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-grow pt-0 space-y-4">
            {recentReturns.length > 0 ? (
              recentReturns.map((item: ReturnItem) => (
                <Link 
                  key={item.id} 
                  // Navigate to the main returns list page
                  to="/returns"
                  // Pass the specific return ID as a search parameter
                  search={{ returnId: item.id }} 
                  className="flex items-center justify-between p-3 -m-3 hover:bg-muted rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                         <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                    <div>
                      <p className="font-medium text-sm">Retoure #{item.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.followUpAction} • {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(item.status) as BadgeVariant} className="text-xs">{getStatusLabel(item.status)}</Badge>
                </Link>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                 <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
                 <p>Keine kürzlichen Retouren.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchase Orders Card */}
        <Card className="lg:col-span-1 flex flex-col shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold">Neueste Bestellungen</CardTitle>
            <Link to="/procurement/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              Alle <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-grow pt-0 space-y-4">
            {recentPOrders.length > 0 ? (
               recentPOrders.map((order: PurchaseOrder) => (
                 <Link 
                  key={order.id} 
                  to="/procurement/orders/$orderId" 
                  params={{ orderId: order.id }} 
                  className="flex items-center justify-between p-3 -m-3 hover:bg-muted rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                         <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                    <div>
                      <p className="font-medium text-sm">PO #{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                         {order.title || 'Kein Titel'} • {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                   </div>
                   <Badge variant={getStatusVariant(order.status) as BadgeVariant} className="text-xs">{getStatusLabel(order.status)}</Badge>
                </Link>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                 <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-2" />
                 <p>Keine kürzlichen Bestellungen.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
         {/* Quick Actions Card */}
         <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-lg font-semibold">Aktionen</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={() => navigate({ to: '/returns'})}>
                      <Package className="mr-2 h-4 w-4" /> Neue Retoure anlegen
                    </Button>
                    {/* TODO: Ensure route /procurement/requisitions/new exists */}
                    <Button className="w-full justify-start" variant="outline" onClick={() => navigate({ to: '/procurement/requisitions'})}>
                      <FilePlus className="mr-2 h-4 w-4" /> Neue Anforderung erstellen
                    </Button>
                     {/* Add more common actions here if needed */}
                 </CardContent>
            </Card>

            {/* Quick Links Card - now in the third column */}
            <Card className="shadow-sm">
                 <CardHeader>
                   {/* Corrected closing tag for CardTitle */}
                   <CardTitle className="text-lg font-semibold">Schnellzugriff</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-1">
                     <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-primary hover:bg-transparent" onClick={() => navigate({ to: '/orders' })}>
                         <List className="h-4 w-4" /> JTL Bestellungen <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
                     </Button>
                      <Separator className="my-1"/>
                     <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-primary hover:bg-transparent" onClick={() => navigate({ to: '/suppliers' })}>
                         <Building2 className="h-4 w-4" /> Lieferanten <Badge variant="secondary" className="ml-auto">{activeSuppliers}</Badge>
                     </Button>
                     <Separator className="my-1"/>
                     <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-primary hover:bg-transparent" onClick={() => navigate({ to: '/procurement/requisitions' })}>
                         <FileText className="h-4 w-4" /> Anforderungen <Badge variant="secondary" className="ml-auto">{requisitions.length}</Badge>
                     </Button>
                     <Separator className="my-1"/>
                     {/* Corrected link to point to the main settings route */}
                     <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-primary hover:bg-transparent" onClick={() => navigate({ to: '/settings' })}>
                         <Settings className="h-4 w-4" /> Einstellungen
                     </Button>
                 </CardContent>
            </Card>
         {/* Corrected closing tag for div */}
         </div>

      {/* Corrected closing tag for the main div */}
      </div>

    {/* Corrected closing tag for the component return */}
    </div>
  );
}

// Add variants to Badge component if not already defined elsewhere
// Example - you might need to define these in your ui/badge.tsx
/*
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
*/
