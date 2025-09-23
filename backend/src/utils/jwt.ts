import * as jwt from 'jsonwebtoken';

const ACCESS_SECRET: jwt.Secret = process.env.ACCESS_TOKEN_SECRET || 'access-secret-dev';
const REFRESH_SECRET: jwt.Secret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-dev';

export function signAccessToken(payload: object) {
  const opts: jwt.SignOptions = { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES || '15m') as any };
  return jwt.sign(payload as jwt.JwtPayload | string, ACCESS_SECRET, opts);
}

export function signRefreshToken(payload: object) {
  const opts: jwt.SignOptions = { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES || '7d') as any };
  return jwt.sign(payload as jwt.JwtPayload | string, REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
