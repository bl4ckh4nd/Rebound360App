import { Router, Route, RootRoute, FileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { RootLayout } from '../components/root-layout'
import { Dashboard } from '../components/dashboard'
import { ProcurementDashboard } from '../components/procurement/procurement-dashboard'
import { RequisitionsList } from '../components/procurement/requisitions-list'
import { PurchaseOrdersList } from '../components/procurement/purchase-orders-list'
import { ProcurementLayout } from '../components/procurement/procurement-layout'
import { PurchaseOrderDetails } from '../components/procurement/purchase-order-details'
import { ApprovalQueue } from '../components/procurement/approval-queue'
import { RequisitionDetail } from '../components/procurement/requisition-detail'
import { OrdersTable } from '../components/orders-table'
import { ReturnsTable } from '../components/returns-table'
import { Settings } from '../components/settings'
import { Suppliers } from '../components/suppliers'
import type { Order, ReturnItem, Supplier } from '../shared/types'
import { ErrorBoundary } from '../components/error-boundary'
import { OrdersApi } from '../shared/api/orders-api'

// Define route types
type RouteMeta = {
  name?: string;
  navGroup?: 'main' | 'procurement';
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  
  interface RouteMeta {
    meta?: RouteMeta;
  }
}

declare global {
  interface Window {
    electron: {
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  }
}

console.log('routes.ts: Initializing routes');

// Replace loader data with useReturns hook
export interface OrdersRouteLoaderData {
  orders: Order[];
}

export interface ReturnsRouteLoaderData {
  returns: ReturnItem[];
}

const rootRoute = new RootRoute({
  component: RootLayout,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const ordersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'orders',
  component: OrdersTable,
  loader: async () => {
    try {
      const orders = await OrdersApi.getAll();
      console.log('Orders loader: Fetched orders:', orders);
      return { orders } satisfies OrdersRouteLoaderData;
    } catch (error) {
      console.error('Orders loader error:', error);
      return { orders: [] } satisfies OrdersRouteLoaderData;
    }
  },
  errorComponent: ErrorBoundary
});

const returnsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'returns',
  component: ReturnsTable,
});

const procurementRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'procurement',
  component: ProcurementLayout,
  errorComponent: ({ error }: { error: Error }) => {
    console.error('Procurement route error:', error);
    return React.createElement('div', null, 'An error occurred in the procurement module. Please try again.');
  }
});

const procurementDashboardRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: '/',
  component: ProcurementDashboard,
});

const requisitionsRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: 'requisitions',
  component: RequisitionsList,
});

const requisitionDetailRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: 'requisitions/$requisitionId',
  component: RequisitionDetail,
});

const approvalsRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: 'approvals',
  component: ApprovalQueue,
});

const purchaseOrdersRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: 'orders',
  component: PurchaseOrdersList,
});

const purchaseOrderDetailsRoute = new Route({
  getParentRoute: () => procurementRoute,
  path: 'orders/$orderId',
  component: PurchaseOrderDetails,
});

const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'settings',
  component: Settings,
  errorComponent: ({ error }: { error: Error }) => {
    console.error('Settings route error:', error);
    return React.createElement('div', null, 'An error occurred in the settings module. Please try again.');
  }
});

const suppliersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'suppliers',
  component: Suppliers,
  errorComponent: ({ error }: { error: Error }) => {
    console.error('Suppliers route error:', error);
    return React.createElement('div', null, 'An error occurred in the suppliers module. Please try again.');
  }
});

// Create router
export const router = new Router({
  routeTree: rootRoute.addChildren([
    indexRoute,
    returnsRoute,
    ordersRoute,
    procurementRoute.addChildren([
      procurementDashboardRoute,
      requisitionsRoute,
      requisitionDetailRoute,
      approvalsRoute,
      purchaseOrdersRoute,
      purchaseOrderDetailsRoute
    ]),
    settingsRoute,
    suppliersRoute
  ]),
  defaultPreload: 'intent',
});

console.log('routes.ts: Router initialized with route tree:', router.options.routeTree);
