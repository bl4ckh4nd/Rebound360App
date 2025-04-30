import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';

console.log('Preload: Starting to expose electron API');

// Expose path utilities that might be needed in renderer
contextBridge.exposeInMainWorld('electronPath', {
  join: (...args: string[]) => path.join(...args),
  dirname: (p: string) => path.dirname(p),
  basename: (p: string) => path.basename(p)
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api',
  {
    // Window controls
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = ['window-control'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid IPC channel: ${channel}`);
    },
    
    // Orders
    getOrderById: (id: string) => ipcRenderer.invoke('get-order', id),
    createOrder: (orderData: any) => ipcRenderer.invoke('create-order', orderData),
    updateOrderStatus: (id: string, status: string) => ipcRenderer.invoke('update-order-status', id, status),
    createReturnFromOrder: (orderId: string, returnData: any) => ipcRenderer.invoke('create-return-from-order', orderId, returnData),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings: any) => ipcRenderer.invoke('update-settings', settings),
    validateSettings: (settings: any) => ipcRenderer.invoke('validate-settings', settings),
  }
);

contextBridge.exposeInMainWorld('electron', {
  invoke: async (channel: string, ...args: any[]) => {
    console.log(`Preload: Invoking channel "${channel}" with args:`, args);
    const validChannels = [
      'window-control', 
      'test-jtl-connection',
      'sync-suppliers',
      'sync-orders',
      'sync-all',
      // other valid channels
    ];
    
    if (validChannels.includes(channel)) {
      try {
        const result = await ipcRenderer.invoke(channel, ...args);
        console.log(`Preload: Channel "${channel}" returned:`, result);
        return result;
      } catch (error) {
        console.error(`Preload: Channel "${channel}" failed:`, error);
        throw error;
      }
    } else {
      throw new Error(`Invalid IPC channel: ${channel}`);
    }
  }
});

console.log('Preload: Finished exposing electron API');