import { Response, NextFunction } from 'express';
import { verifyAccessToken, sendError, RequestWithUser } from '../utils/auth';

export function authenticate(req: RequestWithUser, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return sendError(res, 401, 'Missing authorization header');
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return sendError(res, 401, 'Invalid authorization header');
  try {
    const payload = verifyAccessToken(parts[1]);
    req.user = payload;
    return next();
  } catch (err: any) {
    return sendError(res, 401, 'Invalid or expired token');
  }
}
