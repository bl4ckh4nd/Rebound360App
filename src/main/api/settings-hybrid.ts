import { Router, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as settingsDb from '../database/settings';
import { DatabaseSettings } from '../../shared/types';
import workflowsHybridRouter from './workflows-hybrid';
import customFieldsHybridRouter from './custom-fields-hybrid';
import reasonsHybridRouter from './reasons-hybrid';
import { featureFlags, enablePerformanceLogging } from '../utils/feature-flags';

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>
) => Promise<void> | void;

/**
 * Complete hybrid settings API that routes to appropriate implementations
 * Combines database settings, workflows, custom fields, and reasons
 */
const router = Router();

// Health check endpoint
router.get('/health', (async (req, res) => {
  try {
    const flagStatus = featureFlags.getAllFlags();
    
    const healthData = {
      status: 'healthy',
      message: 'Settings API operational',
      featureFlags: {
        workflows: flagStatus.useTypeORMForWorkflows,
        customFields: flagStatus.useTypeORMForCustomFields,
        reasons: flagStatus.useTypeORMForReasons,
        performanceLogging: flagStatus.enablePerformanceLogging
      },
      timestamp: new Date().toISOString()
    };

    if (enablePerformanceLogging()) {
      console.log('🏥 Settings API health check completed', healthData);
    }

    res.json({ data: healthData });
  } catch (error) {
    console.error('Error in settings health check:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}) as RequestHandler);

// Database settings endpoints (non-TypeORM, security-sensitive)
router.get('/database', (async (req, res) => {
  try {
    const settings = await settingsDb.getDatabaseSettings();
    if (!settings) {
      res.status(404).json({ error: 'Database settings not found' });
      return;
    }
    
    // Don't send the password to the client for security reasons
    const secureSettings = { ...settings, password: '********' };
    res.json({ data: secureSettings });
  } catch (error) {
    console.error('Error fetching database settings:', error);
    res.status(500).json({ error: 'Failed to fetch database settings' });
  }
}) as RequestHandler);

router.post('/database', (async (req, res) => {
  try {
    const settings: DatabaseSettings = req.body;
    
    if (!settings.host || !settings.port || !settings.database || !settings.username) {
      res.status(400).json({ error: 'Missing required database settings' });
      return;
    }
    
    // Get existing settings to preserve password if not provided
    const existingSettings = await settingsDb.getDatabaseSettings();
    if (existingSettings && !settings.password) {
      settings.password = existingSettings.password;
    }
    
    settingsDb.setDatabaseSettings(settings);
    
    // Don't send the password to the client for security reasons
    const secureSettings = { ...settings, password: '********' };
    
    res.json({ data: secureSettings });
  } catch (error) {
    console.error('Error updating database settings:', error);
    res.status(500).json({ error: 'Failed to update database settings' });
  }
}) as RequestHandler<{}, any, DatabaseSettings>);

router.post('/database/test', (async (req, res) => {
  // Import SQL here to avoid loading it unless needed
  const sql = await import('mssql');
  
  const settings: DatabaseSettings = req.body;
  const lastConnectionTest = new Date().toISOString();
  console.log('[API /database/test] Received settings:', { ...settings, password: '****' });

  // Validate required settings
  if (!settings.host || !settings.port || !settings.database || !settings.username) {
    console.log('[API /database/test] Validation failed');
    res.status(400).json({ 
      success: false, 
      message: 'Fehler: Hostname, Port, Datenbankname und Benutzername sind erforderlich.',
      lastConnectionTest
    });
    return;
  }

  const config = {
    user: settings.username,
    password: settings.password,
    server: settings.host,
    port: settings.port,
    database: settings.database,
    options: {
      encrypt: settings.useSSL,
      trustServerCertificate: true
    },
    connectionTimeout: settings.connectionTimeout || 15000,
    requestTimeout: settings.connectionTimeout || 15000
  };
  console.log('[API /database/test] Using connection config:', { ...config, password: '****' });

  let pool: any = null;
  try {
    console.log(`[API /database/test] Attempting DB connection to ${config.server}:${config.port}/${config.database} as ${config.user}`);
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('[API /database/test] DB Connection successful');

    res.json({ 
      success: true, 
      message: 'Verbindung erfolgreich hergestellt.',
      lastConnectionTest
    });

  } catch (err) {
    console.error('[API /database/test] DB Connection failed:', err);
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    
    res.status(400).json({ 
      success: false, 
      message: `Verbindung fehlgeschlagen: ${errorMessage}`,
      lastConnectionTest
    });

  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('DB Connection pool closed.');
      } catch (closeErr) {
        console.error('Error closing DB connection pool:', closeErr);
      }
    }
  }
}) as RequestHandler<{}, any, DatabaseSettings>);

// Mount hybrid sub-routers for different settings areas
router.use('/workflows', workflowsHybridRouter);
router.use('/custom-fields', customFieldsHybridRouter);
router.use('/', reasonsHybridRouter); // Includes /reason-categories and /reasons

// Feature flag status endpoint
router.get('/feature-flags', (async (req, res) => {
  try {
    const flags = featureFlags.getAllFlags();
    
    const settingsFlags = {
      workflows: flags.useTypeORMForWorkflows,
      customFields: flags.useTypeORMForCustomFields,
      reasons: flags.useTypeORMForReasons,
      performanceLogging: flags.enablePerformanceLogging,
      autoFallback: flags.enableAutoFallback
    };

    if (enablePerformanceLogging()) {
      console.log('🚩 Settings feature flags requested:', settingsFlags);
    }

    res.json({ data: settingsFlags });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
}) as RequestHandler);

// Settings summary endpoint (TypeORM-enhanced feature)
router.get('/summary', (async (req, res) => {
  try {
    // This could be enhanced with TypeORM to provide rich statistics
    const summary = {
      database: {
        configured: !!(await settingsDb.getDatabaseSettings()),
        lastTested: null // Could be enhanced
      },
      workflows: {
        implementation: featureFlags.isEnabled('useTypeORMForWorkflows') ? 'typeorm' : 'sqlite',
        available: true
      },
      customFields: {
        implementation: featureFlags.isEnabled('useTypeORMForCustomFields') ? 'typeorm' : 'sqlite',
        available: true
      },
      reasons: {
        implementation: featureFlags.isEnabled('useTypeORMForReasons') ? 'typeorm' : 'sqlite',
        available: true
      },
      timestamp: new Date().toISOString()
    };

    if (enablePerformanceLogging()) {
      console.log('📊 Settings summary requested:', summary);
    }

    res.json({ data: summary });
  } catch (error) {
    console.error('Error fetching settings summary:', error);
    res.status(500).json({ error: 'Failed to fetch settings summary' });
  }
}) as RequestHandler);

// Export the setup function to match main.ts expectation
export function setupSettingsHybridApi() {
  // Log feature flag status on API setup
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Settings Hybrid API initialized');
    featureFlags.logStatus();
  }
  
  return router;
}

export default router;