import { Router } from 'express';
import returnsRouter from './returns';
import ordersRouter from './orders';
import settingsRouter from './settings';
import procurementRouter from './procurement';
import shippingRouter from './shipping';

const router = Router();

// Register all routes
router.use('/returns', returnsRouter);
router.use('/orders', ordersRouter);
router.use('/settings', settingsRouter);
router.use('/procurement', procurementRouter);
router.use('/shipping', shippingRouter);

// Remove test route for populating orders
/*
if (process.env.NODE_ENV === 'development') {
  router.post('/test/populate-orders', (_req, res) => {
    try {
      const sampleOrders = [
        {
          orderNumber: "B2023-001",
          supplierReference: "SUP-001",
          orderDate: "2023-01-15",
          deliveryDate: "2023-01-20",
          supplierName: "Supplier A",
          status: "geliefert" as const,
          products: [
            {
              id: crypto.randomUUID(),
              productName: "Product 1",
              quantity: 5,
              price: 99.99,
              sku: "SKU001",
              serialNumber: "SN001"
            },
            {
              id: crypto.randomUUID(),
              productName: "Product 2",
              quantity: 3,
              price: 149.99,
              sku: "SKU002",
              serialNumber: "SN002"
            }
          ]
        },
        {
          orderNumber: "B2023-002",
          supplierReference: "SUP-002",
          orderDate: "2023-02-01",
          deliveryDate: "2023-02-10",
          supplierName: "Supplier B",
          status: "teilgeliefert" as const,
          products: [
            {
              id: crypto.randomUUID(),
              productName: "Product 3",
              quantity: 2,
              price: 199.99,
              sku: "SKU003"
            },
            {
              id: crypto.randomUUID(),
              productName: "Product 4",
              quantity: 1,
              price: 299.99,
              sku: "SKU004",
              serialNumber: "SN004"
            }
          ]
        },
        {
          orderNumber: "B2023-003",
          supplierReference: "SUP-003",
          orderDate: "2023-03-01",
          supplierName: "Supplier C",
          status: "bestellt" as const,
          products: [
            {
              id: crypto.randomUUID(),
              productName: "Product 5",
              quantity: 10,
              price: 49.99,
              sku: "SKU005"
            }
          ]
        }
      ];

      // Import database functions dynamically to avoid circular dependencies
      import('../database').then(({ createOrder }) => {
        sampleOrders.forEach(order => {
          try {
            createOrder(order);
          } catch (err) {
            console.error('Error creating sample order:', err);
          }
        });

        res.json({ success: true, message: 'Sample orders created' });
      });
    } catch (error) {
      console.error('Error populating sample orders:', error);
      res.status(500).json({ error: 'Error populating sample orders' });
    }
  });
}
*/

export default router;