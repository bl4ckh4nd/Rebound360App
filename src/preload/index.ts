import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = [
        'test-jtl-connection',
        'sync-suppliers',
        'sync-orders',
        'sync-all',
        'window-control',
        // ... other valid channels
      ]
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      throw new Error(`Invalid IPC channel: ${channel}`)
    }
  }
) 