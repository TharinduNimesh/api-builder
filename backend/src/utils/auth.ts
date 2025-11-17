import * as jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

export type TokenPayload = { userId: string; email: string } & Record<string, any>;

const ACCESS_SECRET: jwt.Secret = process.env.ACCESS_TOKEN_SECRET || 'access-secret-dev';
const REFRESH_SECRET: jwt.Secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-dev';
export const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
export const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';

export function signAccessToken(payload: TokenPayload) {
  const opts: jwt.SignOptions = { expiresIn: (ACCESS_EXPIRES as any) };
  return jwt.sign(payload as jwt.JwtPayload | string, ACCESS_SECRET, opts);
}

export function signRefreshToken(payload: TokenPayload) {
  const opts: jwt.SignOptions = { expiresIn: (REFRESH_EXPIRES as any) };
  return jwt.sign(payload as jwt.JwtPayload | string, REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

// Standard cookie options for the refresh token
export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // For production deployments where frontend and backend are on different
  // origins, browsers require `SameSite=None` plus `Secure` for the cookie
  // to be accepted in cross-site requests. In development we keep `lax`
  // to avoid dealing with HTTPS locally.
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Lightweight normalization helpers
export function normalizeEmail(email?: string) {
  if (!email) return '';
  return String(email).trim().toLowerCase();
}

// Standardized error responder so controllers return consistent shapes
export function sendError(res: Response, status: number, message: string, details?: any) {
  const payload: any = { status: 'error', message };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

// Request extension type for TypeScript clarity
export interface RequestWithUser extends Request {
  user?: TokenPayload;
}
