import { ipcMain } from 'electron';
import { 
  getOrderById,
  createOrder,
  updateOrderStatus,
  createReturn
} from './database';
import { Order, OrderStatus } from '../shared/types';

export function setupIpcHandlers() {
  // Orders
  ipcMain.handle('get-order', async (_event, id: string) => {
    const jtlId = parseInt(id, 10);
    if (isNaN(jtlId)) {
      console.error('[IPC get-order] Invalid ID received:', id);
      return null;
    }
    return getOrderById(jtlId);
  });

  ipcMain.handle('create-order', async (_event, orderData: any) => {
    console.warn('[IPC create-order] Called, but local creation is disabled.');
    return createOrder(orderData);
  });

  ipcMain.handle('update-order-status', async (_event, id: string, status: Order['status']) => {
    const jtlId = parseInt(id, 10);
    if (isNaN(jtlId)) {
      console.error('[IPC update-order-status] Invalid ID received:', id);
      return false;
    }
    return updateOrderStatus(jtlId, status);
  });

  ipcMain.handle('create-return-from-order', async (_event, orderId: string, returnData: any) => {
    const jtlOrderId = parseInt(orderId, 10);
    if (isNaN(jtlOrderId)) {
      console.error('[IPC create-return-from-order] Invalid orderId received:', orderId);
      throw new Error('Invalid order ID for return creation.');
    }
    return createReturn({ ...returnData, orderId: jtlOrderId });
  });

  // Settings
  ipcMain.handle('get-settings', async () => {
    // TODO: Implement settings handlers
    return {};
  });

  ipcMain.handle('update-settings', async (_event, settings: any) => {
    // TODO: Implement settings handlers
    return settings;
  });

  ipcMain.handle('validate-settings', async (_event, settings: any) => {
    // TODO: Implement settings handlers
    return { isValid: true };
  });
} 
