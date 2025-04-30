import { ConnectionPool, config as SQLConfig } from 'mssql';
import db from './db';
import { getDatabaseSettings } from './settings';
import { DatabaseSettings } from '../../shared/types';

class JTLConnectionManager {
  private static instance: JTLConnectionManager;
  private pool: ConnectionPool | null = null;
  private settings: DatabaseSettings | null = null;

  private constructor() {}

  static getInstance(): JTLConnectionManager {
    if (!JTLConnectionManager.instance) {
      JTLConnectionManager.instance = new JTLConnectionManager();
    }
    return JTLConnectionManager.instance;
  }

  async getConnection(): Promise<ConnectionPool> {
    if (!this.settings || !this.pool?.connected) {
      console.log('[JTLConnection] Attempting to load settings and establish connection...');
      
      this.settings = await getDatabaseSettings();
      
      if (!this.settings) {
        console.error('[JTLConnection] Failed to load database settings from settingsDb.');
        throw new Error('JTL database settings not found');
      }
      console.log('[JTLConnection] Settings loaded successfully (password decrypted).');

      if (this.pool && !this.pool.connected) {
        await this.close();
      }

      const config: SQLConfig = {
        user: this.settings.username,
        password: this.settings.password,
        database: this.settings.database,
        server: this.settings.host,
        port: this.settings.port,
        options: {
          encrypt: this.settings.useSSL,
          trustServerCertificate: true,
        },
        connectionTimeout: this.settings.connectionTimeout || 15000,
        requestTimeout: this.settings.connectionTimeout || 15000
      };
      
      console.log('[JTLConnection] Creating new connection pool with config:', { ...config, password: '****' });
      try {
        this.pool = await new ConnectionPool(config).connect();
        console.log('[JTLConnection] Connection pool connected successfully.');
      } catch (connectionError) {
        console.error('[JTLConnection] Error connecting pool:', connectionError);
        this.pool = null;
        throw connectionError;
      }
    }

    if (!this.pool) {
      console.error('[JTLConnection] Pool is unexpectedly null after connection attempt.');
      throw new Error('Failed to establish database connection pool.');
    }
    return this.pool;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const testTimestamp = new Date().toISOString();
    try {
      console.log(`[JTLConnection testConnection ${testTimestamp}] Attempting test.`);
      const pool = await this.getConnection(); 
      await pool.request().query('SELECT 1');
      console.log(`[JTLConnection testConnection ${testTimestamp}] Test query successful.`);
      return { success: true, message: 'Verbindung erfolgreich' };
    } catch (error) {
      console.error(`[JTLConnection testConnection ${testTimestamp}] Test failed:`, error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      return { 
        success: false, 
        message: `Verbindung fehlgeschlagen: ${errorMessage}` 
      };
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

export const jtlConnection = JTLConnectionManager.getInstance();
export type { DatabaseSettings };
