import { Router, Request, Response } from 'express';

const router = Router();

// Basic health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({ 
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

export function setupServerApi() {
  return router;
}

export default router;