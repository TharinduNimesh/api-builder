import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route';

const app = express();

app.use(express.json());
app.use(cookieParser());

// enable CORS for frontend
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({ origin: FRONTEND, credentials: true }));

// mount auth routes
app.use('/api/auth', authRoutes);

// Placeholder root route
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

export default app;
