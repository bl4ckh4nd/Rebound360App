import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { 
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
} from '../database';
import { OrderProduct, OrderStatus } from '../../shared/types';
import { createReturn, getAllReturns } from '../database';
import { setupDocumentsApi } from './documents';

// Extend Express Request type to allow attaching orderId
interface RequestWithOrderId extends Request {
  orderId?: number; // Allow number for jtl_id
}

const router = Router();

// Get all orders
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = getAllOrders();
    res.json({ data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    next(error);
  }
});

// Get order by ID
const getOrderByIdHandler: RequestHandler<{ id: string }> = (req, res, next) => {
  try {
    const jtlId = parseInt(req.params.id, 10);
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }
    const order = getOrderById(jtlId);
    if (order) {
      res.json({ data: order });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error);
    next(error);
  }
};
router.get('/:id', getOrderByIdHandler);

// Create a new order
router.post('/', (req, res, next) => {
  try {
    throw new Error('Local order creation via API is disabled.');
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
});

// Update an order
router.put('/:id', (req, res, next) => {
  try {
    throw new Error('Local order update via API is disabled.');
  } catch (error) {
    console.error(`Error updating order ${req.params.id}:`, error);
    next(error);
  }
});

// Update order status
const updateOrderStatusHandler: RequestHandler<{ id: string }> = (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }
    
    const jtlId = parseInt(req.params.id, 10);
    if (isNaN(jtlId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }
    
    const success = updateOrderStatus(jtlId, status as OrderStatus);
    if (success) {
      const updatedOrder = getOrderById(jtlId);
      res.json({ data: updatedOrder });
    } else {
      res.status(404).json({ error: 'Order not found or status not updated' });
    }
  } catch (error) {
    console.error(`Error updating status for order ${req.params.id}:`, error);
    next(error);
  }
};
router.patch('/:id/status', updateOrderStatusHandler);

// Create a return from an order
const createReturnFromOrderHandler: RequestHandler<{ id: string }> = (req, res, next) => {
  try {
    const jtlOrderId = parseInt(req.params.id, 10);
    if (isNaN(jtlOrderId)) {
      res.status(400).json({ error: 'Invalid order ID for return creation' });
      return;
    }

    const order = getOrderById(jtlOrderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    const returnData = {
      ...req.body,
      orderId: order.jtl_id,
      orderNumber: order.orderNumber
    };

    const returnId = createReturn({ ...returnData, orderId: jtlOrderId });
    const createdReturn = getAllReturns().find(r => r.id === returnId);
    
    if (createdReturn) {
      res.status(201).json({ data: createdReturn });
    } else {
      throw new Error('Failed to retrieve created return');
    }
  } catch (error) {
    console.error(`Error creating return for order ${req.params.id}:`, error);
    next(error);
  }
};
router.post('/:id/create-return', createReturnFromOrderHandler);

// Delete an order
router.delete('/:id', (req, res, next) => {
  try {
    throw new Error('Local order deletion via API is disabled.');
  } catch (error) {
    console.error(`Error deleting order ${req.params.id}:`, error);
    next(error);
  }
});

// Mount document routes under order ID
router.use('/:id/documents', 
  (req: RequestWithOrderId, res: Response, next: NextFunction): void => {
    try {
      const jtlId = parseInt(req.params.id, 10);
      if (isNaN(jtlId)) {
        res.status(400).json({ error: 'Invalid order ID for documents' });
        return;
      }
      const order = getOrderById(jtlId);
      if (!order) {
        res.status(404).json({ error: 'Order not found for documents' });
        return;
      }
      req.orderId = order.jtl_id;
      next();
    } catch (error) {
      console.error(`Error in documents middleware for order ${req.params.id}:`, error);
      next(error);
    }
  },
  setupDocumentsApi()
);

export function setupOrdersApi() {
  return router;
}

export default router;