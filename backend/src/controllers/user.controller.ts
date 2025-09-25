import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { sendError } from '../utils/auth';

export async function listUsers(req: Request, res: Response) {
  try {
    const q = String(req.query.status || 'all');
    const status = q === 'active' || q === 'inactive' ? (q as 'active' | 'inactive') : 'all';
    const users = await userService.listUsers(status);
    return res.json({ status: 'ok', users });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to list users', e?.details);
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const userId = String(req.params.id || '');
    if (!userId) return sendError(res, 400, 'Missing user id');
    const body = req.body || {};
    if (typeof body.is_active !== 'boolean') return sendError(res, 400, 'Missing is_active boolean in body');
    const user = await userService.setUserStatus(userId, body.is_active);
    return res.json({ status: 'ok', user });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to update user status', e?.details);
  }
}
