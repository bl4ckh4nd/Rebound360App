import db from './db';
import { Order, OrderProduct, OrderStatus } from '../../shared/types';

interface OrderRow {
  id: string;
  orderNumber: string;
  supplierReference: string;
  orderDate: string;
  deliveryDate: string | null;
  supplierName: string;
  status: Order['status'];
  products: string;
  createdAt: string;
  updatedAt: string;
}

export function initializeOrderTables(): void {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS supplier_orders (
      jtl_id INTEGER PRIMARY KEY,
      orderNumber TEXT,
      orderDate TEXT,
      jtl_supplier_id INTEGER,
      supplierName TEXT,
      status TEXT,
      deliveryDate TEXT,
      supplierReference TEXT,
      last_synced TEXT NOT NULL,
      FOREIGN KEY (jtl_supplier_id) REFERENCES suppliers(jtl_id) ON DELETE SET NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS order_products (
      jtl_id INTEGER PRIMARY KEY,
      orderId INTEGER NOT NULL,
      jtl_article_id INTEGER,
      productName TEXT,
      quantity REAL,
      price REAL,
      sku TEXT,
      last_synced TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES supplier_orders(jtl_id) ON DELETE CASCADE
    )
  `).run();

  db.prepare('CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier_id ON supplier_orders (jtl_supplier_id)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders (status)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON order_products (orderId)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_order_products_article_id ON order_products (jtl_article_id)').run();
}

export function getAllOrders(): Order[] {
  const orders = db.prepare(`SELECT 
      jtl_id, orderNumber, orderDate, jtl_supplier_id, supplierName, 
      status, deliveryDate, supplierReference, last_synced 
    FROM supplier_orders 
    ORDER BY orderDate DESC`).all() as any[];

  const getProductsStmt = db.prepare(`SELECT 
      jtl_id, jtl_article_id, productName, quantity, price, sku 
    FROM order_products WHERE jtl_id = ?`);

  return orders.map(order => {
    console.log(`[getAllOrders] Processing order jtl_id: ${order.jtl_id}`);
    const productsRaw = getProductsStmt.all(order.jtl_id) as any[];
    console.log(`[getAllOrders] Raw products query result for ${order.jtl_id}:`, productsRaw);
    
    const mappedProducts = productsRaw.map(p => ({
      id: 0,
      jtl_id: p.jtl_id,
      jtl_article_id: p.jtl_article_id,
      productName: p.productName,
      quantity: p.quantity,
      price: p.price,
      sku: p.sku
    }));
    console.log(`[getAllOrders] Mapped products for ${order.jtl_id}:`, mappedProducts);

    return {
      jtl_id: order.jtl_id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      jtl_supplier_id: order.jtl_supplier_id,
      supplierName: order.supplierName,
      status: order.status as OrderStatus,
      deliveryDate: order.deliveryDate || undefined,
      supplierReference: order.supplierReference || undefined,
      last_synced: order.last_synced,
      products: mappedProducts,
      notes: [],
      documents: []
    };
  });
}

export function getOrderById(jtlOrderId: number): Order | null {
  const order = db.prepare(`SELECT 
      jtl_id, orderNumber, orderDate, jtl_supplier_id, supplierName, 
      status, deliveryDate, supplierReference, last_synced 
    FROM supplier_orders WHERE jtl_id = ?`).get(jtlOrderId) as any;

  if (!order) return null;

  const products = db.prepare(`SELECT 
      jtl_id, jtl_article_id, productName, quantity, price, sku 
    FROM order_products WHERE orderId = ?`).all(jtlOrderId) as any[];

  return {
    jtl_id: order.jtl_id,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    jtl_supplier_id: order.jtl_supplier_id,
    supplierName: order.supplierName,
    status: order.status as OrderStatus,
    deliveryDate: order.deliveryDate || undefined,
    supplierReference: order.supplierReference || undefined,
    last_synced: order.last_synced,
    products: products.map(p => ({
      id: 0,
      jtl_id: p.jtl_id,
      jtl_article_id: p.jtl_article_id,
      productName: p.productName,
      quantity: p.quantity,
      price: p.price,
      sku: p.sku
    })),
    notes: [],
    documents: []
  };
}

export function createOrder(orderData: Omit<Order, 'id'>): Order {
  throw new Error('Local order creation not currently supported, use sync.');
}

export function updateOrderStatus(jtlOrderId: number, status: Order['status']): boolean {
  const result = db.prepare(`
    UPDATE supplier_orders
    SET status = ?, last_synced = ?
    WHERE jtl_id = ?
  `).run(status, new Date().toISOString(), jtlOrderId);
  
  return result.changes > 0;
}

export function updateOrder(id: string, orderData: Partial<Order>): Order | null {
  const { products, ...orderInfo } = orderData;
  
  if (Object.keys(orderInfo).length > 0) {
    const setClauses = Object.keys(orderInfo)
      .map(key => `${key} = @${key}`)
      .join(', ');
      
    db.prepare(`
      UPDATE supplier_orders
      SET ${setClauses}, last_synced = CURRENT_TIMESTAMP
      WHERE jtl_id = @jtl_id
    `).run({ ...orderInfo, jtl_id: id });
  }
  
  if (products) {
    db.prepare('DELETE FROM order_products WHERE orderId = ?').run(id);
    
    const insertProduct = db.prepare(`
      INSERT INTO order_products (
        orderId,
        productName,
        quantity,
        price,
        sku,
        jtl_article_id,
        last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const product of products) {
      insertProduct.run(
        id,
        product.productName,
        product.quantity,
        product.price,
        product.sku,
        product.jtl_article_id,
        new Date().toISOString()
      );
    }
  }
  
  return getOrderById(Number(id));
}

export function deleteOrder(id: string): boolean {
  db.prepare('DELETE FROM order_products WHERE orderId = ?').run(id);
  const result = db.prepare('DELETE FROM supplier_orders WHERE jtl_id = ?').run(id);
  return result.changes > 0;
}