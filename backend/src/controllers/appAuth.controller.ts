import { Request, Response } from 'express';
import * as appAuthService from '../services/appAuth.service';
import { signupSchema, signinSchema } from '../validators/appAuth.validator';
import { normalizeEmail, refreshCookieOptions, sendError } from '../utils/auth';

export async function signup(req: Request, res: Response) {
  try {
    const parsed = signupSchema.parse(req.body);
    parsed.email = normalizeEmail(parsed.email);
    const result = await appAuthService.signup(parsed);
    return res.status(201).json({ status: 'ok', user: result.user, accessToken: result.accessToken });
  } catch (err: any) {
    // If signup is disabled on project, return 403 Forbidden
    if (err?.message && String(err.message).toLowerCase().includes('signups are disabled')) {
      return sendError(res, 403, err?.message || 'Signups are disabled');
    }
    return sendError(res, 400, err?.message || 'Signup failed', err?.issues);
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const parsed = signinSchema.parse(req.body);
    parsed.email = normalizeEmail(parsed.email);
    const result = await appAuthService.signin(parsed);
    if (result.refreshToken) res.cookie('appRefreshToken', result.refreshToken, refreshCookieOptions);
    return res.json({ status: 'ok', accessToken: result.accessToken, user: result.user });
  } catch (err: any) {
    return sendError(res, 401, err?.message || 'Signin failed', err?.issues);
  }
}

export async function refresh(req: Request, res: Response) {
  const token = (req as any).cookies?.appRefreshToken || (req as any).body?.refreshToken;
  try {
    const result = await appAuthService.refresh(token);
    if (result.refreshToken) res.cookie('appRefreshToken', result.refreshToken, refreshCookieOptions);
    return res.json({ status: 'ok', accessToken: result.accessToken });
  } catch (err: any) {
    return sendError(res, 401, err?.message || 'Refresh failed');
  }
}

export async function revalidate(req: Request, res: Response) {
  return res.json({ status: 'ok', user: (req as any).user });
}
