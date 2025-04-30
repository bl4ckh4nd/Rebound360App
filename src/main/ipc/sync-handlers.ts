import { ipcMain } from 'electron';
import { syncService } from '../database/sync-service';
import { jtlConnection } from '../database/jtl-connection';

export function registerSyncHandlers(): void {
  // Test JTL connection
  ipcMain.handle('test-jtl-connection', async () => {
    return await jtlConnection.testConnection();
  });

  // Sync suppliers
  ipcMain.handle('sync-suppliers', async () => {
    return await syncService.syncSuppliers();
  });

  // Sync orders
  ipcMain.handle('sync-orders', async () => {
    return await syncService.syncOrders();
  });

  // Sync all
  ipcMain.handle('sync-all', async () => {
    return await syncService.syncAll();
  });
} 