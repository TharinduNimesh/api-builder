import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

// Placeholder root route
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

export default app;
