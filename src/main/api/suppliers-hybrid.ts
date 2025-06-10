import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as suppliersDb from '../database/suppliers';
import { getSupplierRepositoryTypeORM } from '../database/repositories';
import { Supplier } from '../../shared/types';
import { useTypeORMForSuppliers, withTypeORMFallback, enablePerformanceLogging } from '../utils/feature-flags';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

interface IdParams extends ParamsDictionary { id: string }
interface SearchParams extends ParamsDictionary {}

/**
 * Hybrid suppliers API that can use TypeORM or fallback to better-sqlite3
 * This demonstrates the migration pattern for gradual rollout
 */
const router = Router();

// GET /suppliers - List all suppliers with optional filtering
router.get('/', (async (req, res) => {
  try {
    const filters = req.query;
    
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        return await supplierRepo.getAllSuppliers({
          companyName: filters.companyName as string,
          status: filters.status as string,
          category: filters.category as string
        });
      },
      // Fallback to original implementation
      () => suppliersDb.getSuppliers(filters),
      'get-all-suppliers'
    );

    if (enablePerformanceLogging()) {
      const method = useTypeORMForSuppliers() ? 'TypeORM' : 'better-sqlite3';
      console.log(`📊 Suppliers fetched using ${method}`);
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
}) as RequestHandler);

// GET /suppliers/search/:search - Search suppliers
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
        const supplierRepo = getSupplierRepositoryTypeORM();
        return await supplierRepo.searchSuppliers(search.trim());
      },
      // Fallback to basic filter on company name
      () => suppliersDb.getSuppliers({ companyName: search.trim() }),
      'search-suppliers'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error searching suppliers:', error);
    res.status(500).json({ error: 'Failed to search suppliers' });
  }
}) as RequestHandler<{ search: string }>);

// GET /suppliers/:id - Get specific supplier by JTL ID
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const jtlId = parseInt(id, 10);
    
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid supplier ID' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        return await supplierRepo.getSupplierByJtlId(jtlId);
      },
      // Fallback to original implementation
      () => suppliersDb.getSupplierById(jtlId),
      'get-supplier-by-id'
    );

    if (!result) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
}) as RequestHandler<IdParams>);

// GET /suppliers/by-number/:number - Get supplier by supplier number
router.get('/by-number/:number', (async (req, res) => {
  try {
    const { number } = req.params;
    
    if (!number || number.trim().length === 0) {
      res.status(400).json({ error: 'Supplier number is required' });
      return;
    }

    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        return await supplierRepo.getSupplierByNumber(number.trim());
      },
      // Fallback to original implementation
      () => suppliersDb.getSupplierByCode(number.trim()),
      'get-supplier-by-number'
    );

    if (!result) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching supplier by number:', error);
    res.status(500).json({ error: 'Failed to fetch supplier by number' });
  }
}) as RequestHandler<{ number: string }>);

// GET /suppliers/statistics - Get supplier statistics (TypeORM-only feature)
router.get('/statistics', (async (req, res) => {
  try {
    if (!useTypeORMForSuppliers()) {
      res.status(501).json({ 
        error: 'Supplier statistics require TypeORM to be enabled' 
      });
      return;
    }

    const supplierRepo = getSupplierRepositoryTypeORM();
    const stats = await supplierRepo.getSupplierStatistics();

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching supplier statistics:', error);
    res.status(500).json({ error: 'Failed to fetch supplier statistics' });
  }
}) as RequestHandler);

// GET /suppliers/with-orders - Get suppliers with order summary (TypeORM-enhanced feature)
router.get('/with-orders', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation with enhanced data
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        return await supplierRepo.getSuppliersWithOrderSummary();
      },
      // Fallback to basic supplier list
      async () => {
        const suppliers = await suppliersDb.getSuppliers();
        // Add empty summary data for compatibility
        return suppliers.map(supplier => ({
          ...supplier,
          orderCount: 0,
          returnCount: 0,
          lastOrderDate: undefined
        }));
      },
      'get-suppliers-with-orders'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching suppliers with orders:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers with orders' });
  }
}) as RequestHandler);

// GET /suppliers/sync-status - Get suppliers needing sync (TypeORM-enhanced feature)
router.get('/sync-status', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM implementation
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        const needingSync = await supplierRepo.getSuppliersNeedingSync();
        const stats = await supplierRepo.getSupplierStatistics();
        
        return {
          suppliersNeedingSync: needingSync,
          syncSummary: {
            total: stats.totalSuppliers,
            needingSync: needingSync.length,
            recentlyUpdated: stats.recentlyUpdated
          }
        };
      },
      // Fallback to basic sync info
      async () => {
        const suppliers = await suppliersDb.getSuppliers();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const needingSync = suppliers.filter(s => 
          !s.last_synced || new Date(s.last_synced) < oneDayAgo
        );
        
        return {
          suppliersNeedingSync: needingSync,
          syncSummary: {
            total: suppliers.length,
            needingSync: needingSync.length,
            recentlyUpdated: suppliers.filter(s => 
              s.last_synced && new Date(s.last_synced) > oneDayAgo
            ).length
          }
        };
      },
      'get-suppliers-sync-status'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching supplier sync status:', error);
    res.status(500).json({ error: 'Failed to fetch supplier sync status' });
  }
}) as RequestHandler);

// Health check endpoint
router.get('/health', (async (req, res) => {
  try {
    const result = await withTypeORMFallback(
      // TypeORM health check
      async () => {
        const supplierRepo = getSupplierRepositoryTypeORM();
        const stats = await supplierRepo.getSupplierStatistics();
        return {
          status: 'healthy',
          implementation: 'typeorm',
          totalSuppliers: stats.totalSuppliers,
          timestamp: new Date().toISOString()
        };
      },
      // Fallback health check
      async () => {
        const suppliers = await suppliersDb.getSuppliers();
        return {
          status: 'healthy',
          implementation: 'better-sqlite3',
          totalSuppliers: suppliers.length,
          timestamp: new Date().toISOString()
        };
      },
      'suppliers-health-check'
    );

    res.json({ data: result });
  } catch (error) {
    console.error('Error in suppliers health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

export default router;