import 'reflect-metadata'; // Must be first import for TypeORM
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Server } from './server';
import { initializeDatabase } from './database';
import { initializeTypeORM, closeTypeORM } from './database/typeorm-config';
import { setupReturnsApi } from './api/returns';
import { setupDocumentsApi } from './api/documents';
import { setupSettingsApi } from './api/settings';
import { setupOrdersApi } from './api/orders';
import { setupIpcHandlers } from './ipc-handlers';
import { registerSyncHandlers } from './ipc/sync-handlers';

console.log('Main process starting...');

// --- START: Remove the declaration ---
// REMOVE THIS LINE: declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
// --- END: Remove the declaration ---

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const server = new Server(3001);

async function initializeApp() {
  console.log('[initializeApp] Starting initialization...');
  try {
    await initializeDatabase();
    console.log('[initializeApp] Database initialized.');
    
    // Initialize TypeORM
    await initializeTypeORM();
    console.log('[initializeApp] TypeORM initialized.');

    // Register IPC handlers
    // setupIpcHandlers(); // Uncomment if you have this
    // registerSyncHandlers(); // Uncomment if you have this
    console.log('[initializeApp] IPC handlers registered (if any).');

    // Register window control handlers
    ipcMain.handle('window-control', (_, command) => {
       console.log(`[IPC window-control] Received command: ${command}`);
       if (!mainWindow) return;
       switch (command) {
         case 'minimize': mainWindow.minimize(); break;
         case 'maximize':
           if (mainWindow.isMaximized()) mainWindow.unmaximize();
           else mainWindow.maximize();
           break;
         case 'close': mainWindow.close(); break;
       }
    });
    console.log('[initializeApp] Window control handler registered.');

    // Start the Express server
    server.start();
    console.log('[initializeApp] Express server started.');
    console.log('[initializeApp] Initialization completed successfully.');
  } catch (error) {
    console.error('[initializeApp] Initialization Error:', error);
    app.quit();
  }
}

async function createWindow() {
  console.log('[createWindow] Starting window creation...');
  const iconPath = isDev
    ? path.join(__dirname, '../../src/public/rebound360_1.ico')
    : path.join(process.resourcesPath, 'app.ico');

  console.log(`[createWindow] Icon path: ${iconPath}`);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // --- START: Revert preload path ---
      // Use path relative to __dirname. Since main.js and preload.js are both
      // output to dist/main, this should resolve correctly inside app.asar.
      preload: path.join(__dirname, 'preload.js'),
      // --- END: Revert preload path ---
    }
  });
  console.log('[createWindow] BrowserWindow created.');

  let loadPath: string;
  if (isDev) {
    loadPath = 'http://localhost:3000';
    console.log(`[createWindow] Loading URL (Dev): ${loadPath}`);
    mainWindow.loadURL(loadPath);
    mainWindow.webContents.openDevTools();
  } else {
    loadPath = path.join(__dirname, '../renderer/index.html'); // Path relative to dist/main/main.js
    console.log(`[createWindow] Loading File (Prod): ${loadPath}`);
    mainWindow.loadFile(loadPath);
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[createWindow] Failed to load content: ${errorDescription} (Code: ${errorCode})`);
  });
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[createWindow] Content finished loading.');
  });

  mainWindow.on('closed', () => {
    console.log('[createWindow] Window closed.');
    mainWindow = null;
  });

  console.log('[createWindow] Window creation finished.');
}

// App lifecycle events... (keep the rest of your main.ts including whenReady, activate, window-all-closed, error handlers)
app.whenReady().then(async () => {
  console.log('App ready. Initializing app...');
  await initializeApp();
  console.log('App initialized. Creating window...');
  await createWindow();
  console.log('Window created.');

  app.on('activate', () => {
    console.log('App activated.');
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('No windows open, creating new one.');
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed.');
  if (process.platform !== 'darwin') {
    console.log('Quitting app (non-macOS).');
    app.quit();
  }
});

app.on('before-quit', async () => {
  console.log('App quitting, closing TypeORM connection...');
  await closeTypeORM();
});

// Error Handling
process.on('uncaughtException', (error) => {
  console.error('<<<<< UNCAUGHT EXCEPTION START >>>>>');
  console.error(error);
  console.error('<<<<< UNCAUGHT EXCEPTION END >>>>>');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('<<<<< UNHANDLED REJECTION START >>>>>');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('<<<<< UNHANDLED REJECTION END >>>>>');
});