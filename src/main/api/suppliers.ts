import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
// import { ParamsDictionary } from 'express-serve-static-core'; // Removed unused import
import * as db from '../database/suppliers';
import { Supplier } from '../../shared/types';

const suppliersRouter = Router();

// Type helper for request handlers - Removed

interface SupplierFilters {
  status?: string;
  category?: string;
}

// Get all suppliers
suppliersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const suppliers = await db.getSuppliers(filters);
    res.json({ data: suppliers });
  } catch (error) {
    next(error);
  }
});

// Get supplier by ID
const getSupplierByIdHandler: RequestHandler<{id: string}> = async (req, res, next) => {
  try {
    const jtlId = parseInt(req.params.id, 10);
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid supplier ID' });
      return; // Added return for early exit
    }
    const supplier = await db.getSupplierById(jtlId);
    if (supplier) {
      res.json({ data: supplier });
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (err) {
    console.error(`Error getting supplier ${req.params.id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
suppliersRouter.get('/:id', getSupplierByIdHandler);

// Create supplier
/*
suppliersRouter.post('/', (async (req: Request<{}, {}, Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>, res: Response) => {
  try {
    const supplier = await db.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Error creating supplier:', err);
    if (err instanceof Error && err.message.includes('already exists')) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}));
*/

// Update supplier
/*
suppliersRouter.put('/:id', (async (req: Request<{id: string}, {}, Supplier>, res: Response) => {
  try {
    const supplierData = req.body as Supplier;
    
    // Validate that the IDs match
    const paramId = parseInt(req.params.id, 10);
    if (isNaN(paramId) || supplierData.jtl_id !== paramId) {
      return res.status(400).json({ error: 'Request body ID must match URL parameter' });
    }
    
    const updatedSupplier = await db.updateSupplier(supplierData);
    res.json(updatedSupplier);
  } catch (err) {
    console.error(`Error updating supplier ${req.params.id}:`, err);
    if (err instanceof Error && err.message.includes('already exists')) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}));
*/

// Delete supplier
/*
suppliersRouter.delete('/:id', (async (req: Request<{id: string}>, res: Response) => {
  try {
    const jtlId = parseInt(req.params.id, 10);
    if (isNaN(jtlId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }

    const supplier = await db.getSupplierById(jtlId);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    await db.deleteSupplier(jtlId);
    res.status(204).end();
  } catch (err) {
    console.error(`Error deleting supplier ${req.params.id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
}));
*/

export function setupSuppliersApi() {
  return suppliersRouter;
}

export default suppliersRouter;