import { Response, Request } from 'express';
import * as authService from '../services/auth.service';
import { signupSchema, signinSchema } from '../validators/auth.validator';
import { normalizeEmail, refreshCookieOptions, sendError } from '../utils/auth';

export async function signup(req: Request, res: Response) {
  try {
    const parsed = signupSchema.parse(req.body);
    // normalize email
    parsed.email = normalizeEmail(parsed.email);
    const result = await authService.signup(parsed);
    return res.status(201).json({ status: 'ok', user: result.user, accessToken: result.accessToken });
  } catch (err: unknown) {
    const e: any = err;
    const details = e?.issues || undefined;
    return sendError(res, 400, e?.message || 'Signup failed', details);
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const parsed = signinSchema.parse(req.body);
    parsed.email = normalizeEmail(parsed.email);
    const result = await authService.signin(parsed);
    // set refresh token as httpOnly cookie
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    }
    return res.json({ status: 'ok', accessToken: result.accessToken, user: result.user });
  } catch (err: unknown) {
    const e: any = err;
    const details = e?.issues || undefined;
    return sendError(res, 401, e?.message || 'Signin failed', details);
  }
}

export async function refresh(req: Request, res: Response) {
  const token = (req as any).cookies?.refreshToken || (req as any).body?.refreshToken;
  try {
    const result = await authService.refresh(token);
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    }
    return res.json({ status: 'ok', accessToken: result.accessToken });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 401, e?.message || 'Refresh failed');
  }
}

export async function revalidate(req: Request, res: Response) {
  // a protected endpoint to check token validity
  return res.json({ status: 'ok', user: (req as any).user });
}
