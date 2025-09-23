import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route';
// load rate limiter optionally to avoid hard dependency issues in some dev setups
let globalLimiter: any = (req: any, res: any, next: any) => next();
let authLimiter: any = (req: any, res: any, next: any) => next();
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rl = require('express-rate-limit');
  globalLimiter = rl({ windowMs: 60 * 1000, max: 60 });
  authLimiter = rl({ windowMs: 60 * 1000, max: 10, message: { status: 'error', message: 'Too many requests, please try again later' } });
} catch (e) {
  // package not installed - fall back to no-op limiters
}

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

// enable CORS for frontend
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({ origin: FRONTEND, credentials: true }));

// mount auth routes with specific limiter applied
app.use('/api/auth', authLimiter, authRoutes);

// Placeholder root route
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

export default app;
