import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { apiRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Basic configurations
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Apply rate limiting globally to protect routes
app.use('/api', apiRateLimiter);

// Mount routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error occurred:', err);
  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: typeof err?.message === 'string' ? err.message : 'An unexpected error occurred on the server.',
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 PatternMaster Backend Server Running`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🛡️  Rate limiting active (100 req/15min)`);
  console.log(`🔑 OIDC JWT authentication enabled`);
  console.log(`========================================`);
});
