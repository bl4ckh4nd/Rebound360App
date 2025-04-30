import { Button } from '../ui/button'
import { Plus, FileText, Package, Users, Check } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useRequisitions, usePurchaseOrders } from '../../renderer/hooks/useProcurement'
import { useSuppliers } from '../../renderer/hooks/useSuppliers'
import type { Requisition, PurchaseOrder, Supplier } from '../../shared/types'
import { StatCard } from '../ui/stat-card'

export function ProcurementDashboard() {
  const navigate = useNavigate()
  
  const { data: requisitions = [] } = useRequisitions()
  const { data: purchaseOrders = [] } = usePurchaseOrders()
  const { data: suppliers = [] } = useSuppliers()
  
  const pendingApprovals = requisitions.filter((req: Requisition) => 
    ['submitted', 'manager_approval', 'finance_approval'].includes(req.status)
  )
  
  const recentRequisitions = [...requisitions]
    .sort((a: Requisition, b: Requisition) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    
  const recentOrders = [...purchaseOrders]
    .sort((a: PurchaseOrder, b: PurchaseOrder) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Offene Freigaben"
          value={pendingApprovals.length}
          icon={FileText}
          iconColor="info"
          description={pendingApprovals.length > 0 ? undefined : "Keine ausstehenden Freigaben"}
        >
          {pendingApprovals.length > 0 && (
            <Link
              to="/procurement/approvals"
              className="block w-full mt-4"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Freigaben verwalten
              </Button>
            </Link>
          )}
        </StatCard>

        <StatCard
          title="Aktive Bestellungen"
          value={purchaseOrders.filter((po: PurchaseOrder) => po.status !== 'completed').length}
          icon={Package}
          iconColor="success"
        />

        <StatCard
          title="Aktive Lieferanten"
          value={suppliers.filter((s: Supplier) => s.status === 'active').length}
          icon={Users}
          iconColor="warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Requisitions */}
        <StatCard
          title="Neueste Anforderungen"
          value={recentRequisitions.length}
          icon={FileText}
          iconColor="info"
          description={recentRequisitions.length > 0 ? undefined : "Keine neuen Anforderungen"}
        >
          <div className="space-y-4">
            {recentRequisitions.map((req: Requisition) => (
              <Link
                key={req.id}
                to="/procurement/requisitions/$requisitionId"
                params={{ requisitionId: req.id }}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div>
                  <p className="font-medium">{req.title}</p>
                  <p className="text-sm text-gray-500">
                    {req.requesterName} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-sm ${
                  req.status === 'approved' ? 'bg-green-100 text-green-800' :
                  req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {req.status}
                </div>
              </Link>
            ))}
          </div>
          <Button 
            variant="link" 
            className="mt-4"
            onClick={() => navigate({ to: '/procurement/requisitions' })}
          >
            Alle Anforderungen anzeigen
          </Button>
        </StatCard>

        {/* Recent Purchase Orders */}
        <StatCard
          title="Neueste Bestellungen"
          value={recentOrders.length}
          icon={Package}
          iconColor="success"
          description={recentOrders.length > 0 ? undefined : "Keine neuen Bestellungen"}
        >
          <div className="space-y-4">
            {recentOrders.map((order: PurchaseOrder) => (
              <Link
                key={order.id}
                to="/procurement/orders/$orderId"
                params={{ orderId: order.id }}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {order.title} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </div>
              </Link>
            ))}
          </div>
          <Button 
            variant="link" 
            className="mt-4"
            onClick={() => navigate({ to: '/procurement/orders' })}
          >
            Alle Bestellungen anzeigen
          </Button>
        </StatCard>
      </div>
    </div>
  )
}