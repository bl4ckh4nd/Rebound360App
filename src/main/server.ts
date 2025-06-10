import express from 'express';
import { configureExpressApp } from './config/express';
import { setupReturnsApi } from './api/returns';
import { setupDocumentsApi } from './api/documents';
import { setupServerApi } from './api/server';
import { setupSettingsApi } from './api/settings';
import { setupOrdersApi } from './api/orders';
import procurementRouter from './api/procurement';
import suppliersRouter from './api/suppliers';
import shippingRouter from './api/shipping';

// TypeORM routes (for gradual migration)
import { returnsTypeORMRouter } from './api/returns-typeorm';
import { returnsHybridRouter } from './api/returns-hybrid';
import settingsTypeORMRouter from './api/settings-typeorm';
import suppliersHybridRouter from './api/suppliers-hybrid';
import ordersHybridRouter from './api/orders-hybrid';
import procurementHybridRouter from './api/procurement-hybrid';
import shippingHybridRouter from './api/shipping-hybrid';
import documentsHybridRouter from './api/documents-hybrid';
import monitoringRouter from './api/monitoring';

export class Server {
  private app: express.Application;
  private port: number;

  constructor(port: number) {
    this.app = configureExpressApp();
    this.port = port;
    this.configureRoutes();
  }

  private configureRoutes() {
    // Hybrid routes (TypeORM + better-sqlite3 fallback)
    this.app.use('/api/returns', returnsHybridRouter);
    this.app.use('/api/suppliers', suppliersHybridRouter);
    this.app.use('/api/orders', ordersHybridRouter);
    this.app.use('/api/procurement', procurementHybridRouter);
    this.app.use('/api/shipping', shippingHybridRouter);
    this.app.use('/api/documents', documentsHybridRouter);
    
    // Existing routes (better-sqlite3)
    this.app.use('/api/documents-legacy', setupDocumentsApi());
    this.app.use('/api/server', setupServerApi());
    this.app.use('/api/settings', setupSettingsApi());
    this.app.use('/api/orders-legacy', setupOrdersApi());
    this.app.use('/api/procurement-legacy', procurementRouter);
    this.app.use('/api/suppliers-legacy', suppliersRouter);
    this.app.use('/api/shipping-legacy', shippingRouter);
    
    // TypeORM routes (for migration testing and gradual rollout)
    this.app.use('/api/returns-typeorm', returnsTypeORMRouter);
    this.app.use('/api/settings-v2', settingsTypeORMRouter);
    
    // Monitoring API for TypeORM migration
    this.app.use('/api/monitoring', monitoringRouter);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

// Create and start server if this file is run directly
if (typeof require !== 'undefined' && require.main === module) {
  const server = new Server(3001);
  server.start();
}