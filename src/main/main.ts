import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Server } from './server';
import { initializeDatabase } from './database';
import { setupReturnsApi } from './api/returns';
import { setupDocumentsApi } from './api/documents';
import { setupSettingsApi } from './api/settings';
import { setupOrdersApi } from './api/orders';
import { setupIpcHandlers } from './ipc-handlers';
import { registerSyncHandlers } from './ipc/sync-handlers';

let mainWindow: BrowserWindow | null = null;

// Define development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Initialize Express server but don't start it yet
const server = new Server(3001);

// Initialize database when the app starts
initializeDatabase();

// Register IPC handlers
registerSyncHandlers();

// Register window control handlers
ipcMain.handle('window-control', (_, command) => {
  if (!mainWindow) return;
  
  switch (command) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

async function createWindow() {
  // Define the icon path based on environment
  
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.ico') // Assuming Forge copies icon as app.ico on Windows
    : path.join(__dirname, 'src/public/rebound360_1.ico'); // Relative path for development

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Remove the default window frame
    icon: iconPath, // Add the icon path here
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.webContents.openDevTools();
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }


}

async function initialize() {
  try {
    // Set up IPC handlers
    setupIpcHandlers();
    
    // Then set up API routes
    setupReturnsApi();
    setupDocumentsApi();
    setupSettingsApi();
    setupOrdersApi();
    
    // Start the server after database and routes are initialized
    server.start();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
    app.quit();
  }
}

app.whenReady().then(async () => {
  await initialize();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  if (mainWindow) {
    mainWindow.webContents.send('error', {
      type: 'uncaught-exception',
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      detail: error.message
    });
  }
});

process.on('unhandledRejection', (error: any) => {
  console.error('Unhandled rejection:', error);
  if (mainWindow) {
    mainWindow.webContents.send('error', {
      type: 'unhandled-rejection',
      message: 'Ein Fehler ist aufgetreten',
      detail: error?.message || 'Unbekannter Fehler'
    });
  }
});
