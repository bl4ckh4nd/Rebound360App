interface ElectronPath {
  join: (...args: string[]) => string;
  dirname: (path: string) => string;
  basename: (path: string) => string;
}

interface ElectronAPI {
  // Window controls
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  
  // Returns
  getReturns: () => Promise<any[]>;
  createReturn: (data: any) => Promise<any>;
  updateReturn: (id: string, data: any) => Promise<any>;
  deleteReturn: (id: string) => Promise<void>;
  
  // Orders
  createOrder: (data: any) => Promise<any>;
  
  // Documents
  uploadDocument: (returnId: string, file: File) => Promise<any>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Procurement
  getProcurementItems: (type: string, filters?: Record<string, any>) => Promise<any[]>;
  getProcurementItem: (type: string, id: string) => Promise<any>;
  createProcurementItem: (type: string, data: any) => Promise<any>;
  updateProcurementItem: (type: string, id: string, data: any) => Promise<any>;
  deleteProcurementItem: (type: string, id: string) => Promise<void>;
  convertToPurchaseOrder: (requisitionId: string, options: { billingAddress: any; shippingAddress: any }) => Promise<any>;
}

declare global {
  interface Window {
    electronPath: ElectronPath;
    electron: ElectronAPI;
  }
}