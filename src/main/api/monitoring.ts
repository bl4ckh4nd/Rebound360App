import { Router, Request, Response, RequestHandler } from 'express';
import { validateDatabaseHealth, comparePerformance, testRepositories } from '../database/connection-validator';
import { featureFlags } from '../utils/feature-flags';

/**
 * Monitoring API for TypeORM migration health and performance
 */
const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await validateDatabaseHealth();
    
    const statusCode = health.overall.status === 'healthy' ? 200 :
                      health.overall.status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json({
      status: health.overall.status,
      message: health.overall.message,
      details: {
        betterSqlite3: health.betterSqlite3,
        typeorm: health.typeorm
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Performance comparison endpoint
router.get('/performance', async (req, res) => {
  try {
    const performance = await comparePerformance();
    
    res.json({
      performance: {
        betterSqlite3Ms: performance.betterSqlite3,
        typeormMs: performance.typeorm,
        overheadPercent: performance.overhead
      },
      analysis: {
        acceptable: performance.overhead < 50,
        recommendation: performance.overhead < 50 ? 
          'TypeORM performance is acceptable' :
          'Consider using raw SQL for this operation'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Performance test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Repository functionality test
router.get('/repositories', async (req, res) => {
  try {
    const result = await testRepositories();
    
    res.json({
      repositories: result.success ? 'functional' : 'error',
      error: result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Repository test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Feature flags status
router.get('/feature-flags', (req, res) => {
  try {
    const flags = featureFlags.getAllFlags();
    
    res.json({
      flags,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get feature flags',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enable TypeORM for specific feature (development only)
const enableFeatureHandler: RequestHandler<{ feature: string }> = (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({
      error: 'Feature flag modification only allowed in development'
    });
    return;
  }

  try {
    const { feature } = req.params;
    const flagName = `useTypeORMFor${feature.charAt(0).toUpperCase() + feature.slice(1)}`;
    
    // Validate flag exists
    const allFlags = featureFlags.getAllFlags();
    if (!(flagName in allFlags)) {
      res.status(400).json({
        error: 'Unknown feature flag',
        availableFlags: Object.keys(allFlags)
      });
      return;
    }

    featureFlags.setOverride(flagName as any, true);
    
    res.json({
      message: `${flagName} enabled for development`,
      flags: featureFlags.getAllFlags()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to enable feature flag',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
router.post('/feature-flags/:feature/enable', enableFeatureHandler);

// Disable TypeORM for specific feature (development only)
const disableFeatureHandler: RequestHandler<{ feature: string }> = (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({
      error: 'Feature flag modification only allowed in development'
    });
    return;
  }

  try {
    const { feature } = req.params;
    const flagName = `useTypeORMFor${feature.charAt(0).toUpperCase() + feature.slice(1)}`;
    
    featureFlags.setOverride(flagName as any, false);
    
    res.json({
      message: `${flagName} disabled for development`,
      flags: featureFlags.getAllFlags()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to disable feature flag',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
router.post('/feature-flags/:feature/disable', disableFeatureHandler);

// Migration status endpoint
router.get('/migration-status', async (req, res) => {
  try {
    const health = await validateDatabaseHealth();
    const repoTest = await testRepositories();
    const flags = featureFlags.getAllFlags();
    
    // Calculate migration progress
    const typeormFlags = Object.entries(flags)
      .filter(([key]) => key.startsWith('useTypeORMFor'))
      .map(([key, value]) => ({ feature: key.replace('useTypeORMFor', ''), enabled: value }));
    
    const enabledCount = typeormFlags.filter(f => f.enabled).length;
    const progressPercent = Math.round((enabledCount / typeormFlags.length) * 100);
    
    res.json({
      migration: {
        status: health.typeorm.connected ? 'ready' : 'infrastructure-only',
        progressPercent,
        featuresEnabled: enabledCount,
        totalFeatures: typeormFlags.length,
        features: typeormFlags
      },
      health: {
        database: health.overall.status,
        repositories: repoTest.success ? 'functional' : 'error'
      },
      recommendations: {
        nextSteps: enabledCount === 0 ? [
          'Enable TypeORM for Workflows first',
          'Test workflows endpoint',
          'Validate performance'
        ] : enabledCount === 1 ? [
          'Enable TypeORM for Custom Fields',
          'Test custom fields functionality',
          'Monitor performance impact'
        ] : enabledCount < 4 ? [
          'Continue with low-risk features',
          'Enable Reasons and Categories',
          'Get team feedback'
        ] : [
          'Consider core business logic migration',
          'Plan complex operations migration',
          'Establish production rollout timeline'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get migration status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;