import { Router } from 'express';
import { getSupplierReturnRepository } from '../database/repositories';

/**
 * Example API routes using TypeORM repositories
 * This demonstrates the migration approach - new endpoints can use TypeORM
 * while existing endpoints continue to work with better-sqlite3
 */
export const returnsTypeORMRouter = Router();

// Get all returns with TypeORM
returnsTypeORMRouter.get('/typeorm', async (req, res) => {
  try {
    const repository = getSupplierReturnRepository();
    const returns = await repository.findAll({
      relations: ['products', 'notes', 'documents'],
      order: { createdAt: 'DESC' },
      take: 100
    });
    
    res.json({ 
      data: returns,
      source: 'typeorm'
    });
  } catch (error) {
    console.error('Error fetching returns with TypeORM:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

// Get returns by status with TypeORM
returnsTypeORMRouter.get('/typeorm/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const repository = getSupplierReturnRepository();
    const returns = await repository.findByStatus(status);
    
    res.json({ 
      data: returns,
      source: 'typeorm'
    });
  } catch (error) {
    console.error('Error fetching returns by status:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

// Get aggregated data using hybrid approach
returnsTypeORMRouter.get('/typeorm/aggregated', async (req, res) => {
  try {
    const repository = getSupplierReturnRepository();
    const data = await repository.getReturnsWithAggregatedData();
    
    res.json({ 
      data,
      source: 'hybrid-sqlite'
    });
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(500).json({ error: 'Failed to fetch aggregated data' });
  }
});

// Get statistics using raw SQL
returnsTypeORMRouter.get('/typeorm/statistics', async (req, res) => {
  try {
    const repository = getSupplierReturnRepository();
    const stats = await repository.getStatistics();
    
    res.json({ 
      data: stats,
      source: 'hybrid-sqlite'
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Create return with products
returnsTypeORMRouter.post('/typeorm', async (req, res) => {
  try {
    const repository = getSupplierReturnRepository();
    const newReturn = await repository.createWithProducts(req.body);
    
    res.status(201).json({ 
      data: newReturn,
      source: 'typeorm'
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ error: 'Failed to create return' });
  }
});