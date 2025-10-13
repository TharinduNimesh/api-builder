import { Request, Response } from 'express';
import * as appUserService from '../services/appUser.service';
import { sendError, RequestWithUser } from '../utils/auth';
import * as settingsService from '../services/settings.service';

export async function listAppUsers(req: RequestWithUser, res: Response) {
  try {
    const status = (req.query.status as any) || 'all';
    const users = await appUserService.listAppUsers(status);
    return res.json({ status: 'ok', users });
  } catch (err: any) {
    return sendError(res, 500, err?.message || 'Failed to list app users');
  }
}

export async function setStatus(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    // Only project owner can change app user status
    const settings = await settingsService.getSettings(user.userId);
    const project = settings.project;
    const isOwner = !!(project && project.createdById === user.userId);
    if (!isOwner) return sendError(res, 403, 'Forbidden');

    const appUserId = req.params.id;
    const body = req.body as any;
    if (typeof body.is_active !== 'boolean') return sendError(res, 400, 'is_active boolean required');

    const updated = await appUserService.setAppUserStatus(appUserId, body.is_active);
    return res.json({ status: 'ok', user: updated });
  } catch (err: any) {
    return sendError(res, 400, err?.message || 'Failed to update app user status');
  }
}
