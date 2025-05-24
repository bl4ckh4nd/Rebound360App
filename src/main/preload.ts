import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';

console.log('[Preload] Script starting execution.');

try {
  console.log('[Preload] Attempting to expose api...');
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
  console.log('[Preload] SUCCESS: api exposed.');

  console.log('[Preload] Attempting to expose electron...');
  contextBridge.exposeInMainWorld('electron', {
    invoke: async (channel: string, ...args: any[]) => {
      console.log(`[Preload Electron Invoke] Channel: ${channel}`, args);
      const validChannels = [
        'window-control', 
        'test-jtl-connection',
        'sync-suppliers',
        'sync-orders',
        'sync-all',
        // Add other channels used by your UI components (Titlebar, Sync, etc.)
        'get-order', // Example if used directly via window.electron.invoke
        'update-order-status', // Example
        // other valid channels
      ];
      
      if (validChannels.includes(channel)) {
        try {
          const result = await ipcRenderer.invoke(channel, ...args);
          // console.log(`[Preload Electron Invoke] Channel "${channel}" returned:`, result); // Optional log
          return result;
        } catch (error) {
          console.error(`[Preload Electron Invoke] Error on channel "${channel}":`, error);
          throw error; // Re-throw error to renderer
        }
      } else {
        console.error(`[Preload Electron Invoke] Invalid channel: ${channel}`);
        throw new Error(`Invalid IPC channel: ${channel}`);
      }
    }
  });
  console.log('[Preload] SUCCESS: electron exposed.');

  console.log('[Preload] Attempting to expose electronPath...');
  contextBridge.exposeInMainWorld('electronPath', {
    join: (...args: string[]) => path.join(...args),
    dirname: (filePath: string) => path.dirname(filePath),
    basename: (filePath: string) => path.basename(filePath)
  });
  console.log('[Preload] SUCCESS: electronPath exposed.');

  console.log('[Preload] Script finished execution successfully.');

} catch (error) {
  console.error('[Preload] CRITICAL ERROR during contextBridge execution:', error);
}