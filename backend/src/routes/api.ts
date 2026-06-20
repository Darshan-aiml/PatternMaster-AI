import { Router, Response } from 'express';
import { AuthenticatedRequest, checkJwt } from '../middleware/auth';
import { walkthroughRateLimiter } from '../middleware/rateLimiter';
import { generateWalkthrough, WalkthroughRequest } from '../services/geminiWalkthrough';

const router = Router();

const isValidWalkthroughBody = (body: any): body is WalkthroughRequest => {
  return typeof body?.problemId === 'string'
    && typeof body?.title === 'string'
    && typeof body?.statement === 'string'
    && typeof body?.preferredLanguage === 'string';
};

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

router.post('/walkthrough', walkthroughRateLimiter, async (req, res, next) => {
  try {
    if (!isValidWalkthroughBody(req.body)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Invalid walkthrough request.',
      });
    }

    const walkthrough = await generateWalkthrough(req.body);
    return res.json(walkthrough);
  } catch (error) {
    return next(error);
  }
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
