import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as ordersDb from '../database/orders';
import { getOrderRepositoryTypeORM } from '../database/repositories';
import { Order, OrderStatus } from '../../shared/types';
import { useTypeORMForOrders, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface IdParams extends ParamsDictionary { id: string }

/**
 * Hybrid orders API that can use TypeORM or fallback to better-sqlite3
 * This handles JTL order integration and return creation workflows
 */
const router = Router();

// GET /orders - List all orders with optional filtering
router.get('/', (async (req, res) => {
  try {
    const filters = req.query;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.getAllOrders({
          status: filters.status as string,
          supplierName: filters.supplierName as string,
          orderNumber: filters.orderNumber as string,
          startDate: filters.startDate as string,
          endDate: filters.endDate as string
        });
      },
      // Fallback to original implementation
      () => ordersDb.getAllOrders(),
      'get-all-orders'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForOrders() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Orders fetched using ${method}, count: ${result.length}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}) as RequestHandler);

// Health check endpoint (must be before /:id route)
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        const stats = await orderRepo.getOrderStatistics();
        return {
          status: 'healthy',
          implementation: 'typeorm',
          totalOrders: stats.totalOrders,
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      () => {
        const orders = ordersDb.getAllOrders();
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          totalOrders: orders.length,
          timestamp: new Date().toISOString()
        };
      },
      'orders-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in orders health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

// GET /orders/statistics - Get order statistics (TypeORM-enhanced feature)
router.get('/statistics', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation with enhanced statistics
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.getOrderStatistics();
      },
      // Fallback to basic statistics
      () => {
        const orders = ordersDb.getAllOrders();
        const ordersByStatus: Record<string, number> = {};
        
        orders.forEach(order => {
          ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
        });

        return {
          totalOrders: orders.length,
          ordersByStatus,
          ordersWithProducts: orders.filter(o => o.products.length > 0).length,
          ordersWithReturns: 0, // Cannot calculate easily with better-sqlite3
          recentlyUpdated: 0, // Cannot calculate easily with better-sqlite3
          totalValue: orders.reduce((sum, order) => 
            sum + order.products.reduce((productSum, product) => 
              productSum + (product.quantity * product.price), 0
            ), 0
          )
        };
      },
      'get-order-statistics'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
}) as RequestHandler);

// GET /orders/sync-status - Get orders needing sync (TypeORM-enhanced feature)
router.get('/sync-status', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        const needingSync = await orderRepo.getOrdersNeedingSync();
        const stats = await orderRepo.getOrderStatistics();
        
        return {
          ordersNeedingSync: needingSync,
          syncSummary: {
            total: stats.totalOrders,
            needingSync: needingSync.length,
            recentlyUpdated: stats.recentlyUpdated
          }
        };
      },
      // Fallback to basic sync info
      () => {
        const orders = ordersDb.getAllOrders();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const needingSync = orders.filter(o => 
          !o.last_synced || new Date(o.last_synced) < oneDayAgo
        );
        
        return {
          ordersNeedingSync: needingSync,
          syncSummary: {
            total: orders.length,
            needingSync: needingSync.length,
            recentlyUpdated: orders.filter(o => 
              o.last_synced && new Date(o.last_synced) > oneDayAgo
            ).length
          }
        };
      },
      'get-orders-sync-status'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching order sync status:', error);
    res.status(500).json({ error: 'Failed to fetch order sync status' });
  }
}) as RequestHandler);

// GET /orders/search/:search - Search orders
router.get('/search/:search', (async (req, res) => {
  try {
    const { search } = req.params;
    
    if (!search || search.trim().length < 2) {
      res.status(400).json({ error: 'Search term must be at least 2 characters' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.searchOrders(search.trim());
      },
      // Fallback to basic filter (limited functionality)
      () => {
        const allOrders = ordersDb.getAllOrders();
        return allOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          order.supplierName.toLowerCase().includes(search.toLowerCase()) ||
          (order.supplierReference && order.supplierReference.toLowerCase().includes(search.toLowerCase()))
        );
      },
      'search-orders'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ error: 'Failed to search orders' });
  }
}) as RequestHandler<{ search: string }>);

// GET /orders/:id - Get specific order by JTL ID
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const jtlId = parseInt(id, 10);
    
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.getOrderByJtlId(jtlId);
      },
      // Fallback to original implementation
      () => ordersDb.getOrderById(jtlId),
      'get-order-by-id'
    );

    if (!result) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}) as RequestHandler<IdParams>);

// PATCH /orders/:id/status - Update order status
router.patch('/:id/status', (async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const jtlId = parseInt(id, 10);
    
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        const success = await orderRepo.updateOrderStatus(jtlId, status as OrderStatus);
        if (success) {
          return await orderRepo.getOrderByJtlId(jtlId);
        }
        return null;
      },
      // Fallback to original implementation
      () => {
        const success = ordersDb.updateOrderStatus(jtlId, status as OrderStatus);
        if (success) {
          return ordersDb.getOrderById(jtlId);
        }
        return null;
      },
      'update-order-status'
    );

    if (!result) {
      res.status(404).json({ error: 'Order not found or status not updated' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}) as RequestHandler<IdParams>);

// GET /orders/by-supplier/:supplierId - Get orders by supplier (TypeORM-enhanced feature)
router.get('/by-supplier/:supplierId', (async (req, res) => {
  try {
    const { supplierId } = req.params;
    const jtlSupplierId = parseInt(supplierId, 10);
    
    if (isNaN(jtlSupplierId)) {
      res.status(400).json({ error: 'Invalid supplier ID' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation with enhanced data
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.getOrdersBySupplier(jtlSupplierId);
      },
      // Fallback to basic filtering
      () => {
        const orders = ordersDb.getAllOrders();
        return orders
          .filter(order => order.jtl_supplier_id === jtlSupplierId)
          .map(order => ({
            ...order,
            productCount: order.products.length,
            returnCount: 0 // Cannot calculate easily with better-sqlite3
          }));
      },
      'get-orders-by-supplier'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching orders by supplier:', error);
    res.status(500).json({ error: 'Failed to fetch orders by supplier' });
  }
}) as RequestHandler<{ supplierId: string }>);

// POST /orders/:id/create-return - Create return from order (maintained functionality)
router.post('/:id/create-return', (async (req, res) => {
  try {
    const { id } = req.params;
    const jtlOrderId = parseInt(id, 10);
    
    if (isNaN(jtlOrderId)) {
      res.status(400).json({ error: 'Invalid order ID for return creation' });
      return;
    }

    // Get order using hybrid approach
    const order = await withTypeORMFallback(
      async () => {
        const orderRepo = getOrderRepositoryTypeORM();
        return await orderRepo.getOrderByJtlId(jtlOrderId);
      },
      () => ordersDb.getOrderById(jtlOrderId),
      'get-order-for-return'
    );

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    // Create return using existing returns API (this should use the hybrid returns system)
    const { createReturn, getAllReturns } = require('../database');
    
    const returnData = {
      ...req.body,
      orderId: order.jtl_id,
      orderNumber: order.orderNumber
    };

    const returnId = createReturn({ ...returnData, orderId: jtlOrderId });
    const createdReturn = getAllReturns().find((r: any) => r.id === returnId);
    
    if (createdReturn) {
      res.status(201).json({ data: createdReturn });
    } else {
      throw new Error('Failed to retrieve created return');
    }
  } catch (error) {
    console.error('Error creating return from order:', error);
    res.status(500).json({ error: 'Failed to create return from order' });
  }
}) as RequestHandler<IdParams>);


export default router;