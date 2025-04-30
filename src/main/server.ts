import express from 'express';
import cors from 'cors';
import { setupReturnsApi } from './api/returns';
import { setupDocumentsApi } from './api/documents';
import { setupServerApi } from './api/server';
import { setupSettingsApi } from './api/settings';
import { setupOrdersApi } from './api/orders';
import procurementRouter from './api/procurement';
import suppliersRouter from './api/suppliers';

export class Server {
  private app: express.Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes() {
    this.app.use('/api/returns', setupReturnsApi());
    this.app.use('/api/documents', setupDocumentsApi());
    this.app.use('/api/server', setupServerApi());
    this.app.use('/api/settings', setupSettingsApi());
    this.app.use('/api/orders', setupOrdersApi());
    this.app.use('/api/procurement', procurementRouter);
    this.app.use('/api/suppliers', suppliersRouter);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

// Create and start server if this file is run directly
if (require.main === module) {
  const server = new Server(3001);
  server.start();
}