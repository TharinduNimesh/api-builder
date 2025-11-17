import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import projectRoutes from './routes/project.route';
import userRoutes from './routes/user.route';
import tableRoutes from './routes/table.route';
import functionRoutes from './routes/function.route';
import sqlRoutes from './routes/sql.route';
import settingsRoutes from './routes/settings.route';
import appAuthRoutes from './routes/appAuth.route';
import appUserRoutes from './routes/appUser.route';
import endpointRoutes from './routes/endpoint.route';
import { dynamicExecute } from './controllers/endpoint.controller';
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

// When running behind a reverse proxy (nginx) we need to trust the proxy
// so that `X-Forwarded-For` and related headers are respected. express-rate-limit
// validates presence of X-Forwarded-For only when `trust proxy` is enabled.
// Set to `1` to trust the first proxy in front of the app (nginx).
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

// enable CORS for frontend
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({ origin: FRONTEND, credentials: true }));

// mount auth routes with specific limiter applied
app.use('/api/auth', authLimiter, authRoutes);
// mount project routes
app.use('/api/project', projectRoutes);
// mount user routes
app.use('/api/users', userRoutes);
// table management
app.use('/api/tables', tableRoutes);
// function management routes
app.use('/api/functions', functionRoutes);
// SQL editor routes
app.use('/api/sql', sqlRoutes);
// settings routes
app.use('/api/settings', settingsRoutes);
// endpoints CRUD for API Designer
app.use('/api/endpoints', endpointRoutes);

// application user auth (public API for apps) mounted under /api/b/auth
app.use('/api/b/auth', appAuthRoutes);

// application user management for owners (admin actions) mounted under /api/users/app
app.use('/api/users/app', appUserRoutes);

// Dynamic API execution for designed endpoints under /api/b/*
app.all('/api/b/*', dynamicExecute);

// Placeholder root route
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

export default app;
