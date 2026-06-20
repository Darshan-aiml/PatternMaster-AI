import { Router, Response } from 'express';
import { AuthenticatedRequest, checkJwt } from '../middleware/auth';

const router = Router();

/**
 * Public endpoint.
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Secure endpoint verifying JWT and custom user context.
 */
router.get('/profile', checkJwt, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Secure profile access successful!',
    user: req.user, // Decoded user claims (e.g., sub, email, name)
  });
});

/**
 * Secure endpoint to simulate user data syncing.
 */
router.post('/sync-progress', checkJwt, (req: AuthenticatedRequest, res: Response) => {
  const { progress } = req.body;
  
  // Real world applications would write this data to a relational DB (e.g. Postgres)
  console.log(`Syncing progress for user ${req.user?.sub || 'unknown'}:`, progress);

  res.json({
    status: 'success',
    syncedCount: Array.isArray(progress) ? progress.length : 0,
    message: 'User progress synced successfully.',
  });
});

export default router;
