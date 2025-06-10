import { getDataSource } from './typeorm-config';
import db from './db';

export interface DatabaseHealth {
  betterSqlite3: {
    connected: boolean;
    error?: string;
    tableCount?: number;
    performance?: number; // ms for simple query
  };
  typeorm: {
    connected: boolean;
    error?: string;
    entityCount?: number;
    performance?: number; // ms for simple query
  };
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    message: string;
  };
}

/**
 * Comprehensive database connection and health validator
 */
export class DatabaseValidator {
  /**
   * Validate better-sqlite3 connection and performance
   */
  private async validateBetterSqlite3(): Promise<DatabaseHealth['betterSqlite3']> {
    try {
      const start = Date.now();
      
      // Test basic connectivity
      const result = db.prepare('SELECT 1 as test').get() as { test: number } | undefined;
      if (!result || result.test !== 1) {
        throw new Error('Basic query failed');
      }
      
      // Get table count
      const tables = db.prepare(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).get() as { count: number };
      
      const performance = Date.now() - start;
      
      return {
        connected: true,
        tableCount: tables.count,
        performance
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate TypeORM connection and performance
   */
  private async validateTypeORM(): Promise<DatabaseHealth['typeorm']> {
    try {
      const dataSource = getDataSource();
      
      if (!dataSource || !dataSource.isInitialized) {
        throw new Error('DataSource not initialized');
      }
      
      const start = Date.now();
      
      // Test basic connectivity
      const result = await dataSource.query('SELECT 1 as test');
      if (!result || !result[0] || result[0].test !== 1) {
        throw new Error('Basic query failed');
      }
      
      // Get entity count
      const entityCount = dataSource.entityMetadatas.length;
      
      const performance = Date.now() - start;
      
      return {
        connected: true,
        entityCount,
        performance
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Determine overall database health status
   */
  private determineOverallStatus(
    betterSqlite3: DatabaseHealth['betterSqlite3'],
    typeorm: DatabaseHealth['typeorm']
  ): DatabaseHealth['overall'] {
    // Critical: better-sqlite3 is down (main database)
    if (!betterSqlite3.connected) {
      return {
        status: 'critical',
        message: `Database connection failed: ${betterSqlite3.error}`
      };
    }
    
    // Degraded: TypeORM is down but better-sqlite3 works
    if (!typeorm.connected) {
      return {
        status: 'degraded',
        message: `TypeORM unavailable (${typeorm.error}), using better-sqlite3 only`
      };
    }
    
    // Check performance
    const sqlite3Slow = betterSqlite3.performance && betterSqlite3.performance > 100;
    const typeormSlow = typeorm.performance && typeorm.performance > 200;
    
    if (sqlite3Slow || typeormSlow) {
      return {
        status: 'degraded',
        message: 'Database performance degraded'
      };
    }
    
    // All good
    return {
      status: 'healthy',
      message: 'All database connections healthy'
    };
  }

  /**
   * Perform comprehensive database health check
   */
  async validateConnections(): Promise<DatabaseHealth> {
    console.log('🔍 Starting database health check...');
    
    // Run validations in parallel
    const [betterSqlite3Health, typeormHealth] = await Promise.all([
      this.validateBetterSqlite3(),
      this.validateTypeORM()
    ]);
    
    const overall = this.determineOverallStatus(betterSqlite3Health, typeormHealth);
    
    const health: DatabaseHealth = {
      betterSqlite3: betterSqlite3Health,
      typeorm: typeormHealth,
      overall
    };
    
    // Log results
    this.logHealthStatus(health);
    
    return health;
  }

  /**
   * Log health status in a readable format
   */
  private logHealthStatus(health: DatabaseHealth): void {
    const { betterSqlite3, typeorm, overall } = health;
    
    console.log('📊 Database Health Report:');
    console.log('=' .repeat(40));
    
    // better-sqlite3 status
    if (betterSqlite3.connected) {
      console.log(`✅ better-sqlite3: Connected (${betterSqlite3.tableCount} tables, ${betterSqlite3.performance}ms)`);
    } else {
      console.log(`❌ better-sqlite3: ${betterSqlite3.error}`);
    }
    
    // TypeORM status
    if (typeorm.connected) {
      console.log(`✅ TypeORM: Connected (${typeorm.entityCount} entities, ${typeorm.performance}ms)`);
    } else {
      console.log(`⚠️  TypeORM: ${typeorm.error}`);
    }
    
    // Overall status
    const statusIcon = overall.status === 'healthy' ? '✅' : 
                      overall.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${statusIcon} Overall: ${overall.status.toUpperCase()} - ${overall.message}`);
    console.log('=' .repeat(40));
  }

  /**
   * Quick connectivity test (for monitoring)
   */
  async quickHealthCheck(): Promise<boolean> {
    try {
      // Just test basic connectivity
      const result = db.prepare('SELECT 1').get();
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Test TypeORM repository functionality
   */
  async testRepositoryFunctionality(): Promise<{ success: boolean; error?: string }> {
    try {
      // Import repositories dynamically to avoid circular dependencies
      const { getAppSettingRepository, getCustomFieldRepository } = await import('./repositories');
      const { featureFlags } = await import('../utils/feature-flags');
      
      // Test basic repository operation
      const settingRepo = getAppSettingRepository();
      await settingRepo.count();
      
      // Test custom fields repository if enabled
      if (featureFlags.isEnabled('useTypeORMForCustomFields')) {
        const customFieldRepo = getCustomFieldRepository();
        await customFieldRepo.getAllCustomFields();
        console.log('✅ Custom fields repository test passed');
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Performance comparison test
   */
  async comparePerformance(): Promise<{
    betterSqlite3: number;
    typeorm: number;
    overhead: number;
  }> {
    const iterations = 10;
    
    // Test better-sqlite3 performance
    const sqlite3Times: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      db.prepare('SELECT COUNT(*) FROM sqlite_master').get();
      sqlite3Times.push(Date.now() - start);
    }
    
    // Test TypeORM performance
    const typeormTimes: number[] = [];
    const dataSource = getDataSource();
    
    if (dataSource && dataSource.isInitialized) {
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await dataSource.query('SELECT COUNT(*) FROM sqlite_master');
        typeormTimes.push(Date.now() - start);
      }
    }
    
    const avgSqlite3 = sqlite3Times.reduce((a, b) => a + b, 0) / sqlite3Times.length;
    const avgTypeORM = typeormTimes.length > 0 ? 
      typeormTimes.reduce((a, b) => a + b, 0) / typeormTimes.length : 0;
    
    const overhead = avgTypeORM > 0 ? ((avgTypeORM / avgSqlite3 - 1) * 100) : 0;
    
    return {
      betterSqlite3: avgSqlite3,
      typeorm: avgTypeORM,
      overhead
    };
  }
}

// Singleton instance
export const databaseValidator = new DatabaseValidator();

// Convenience functions
export const validateDatabaseHealth = () => databaseValidator.validateConnections();
export const quickHealthCheck = () => databaseValidator.quickHealthCheck();
export const testRepositories = () => databaseValidator.testRepositoryFunctionality();
export const comparePerformance = () => databaseValidator.comparePerformance();