import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';
import { sendError, RequestWithUser } from '../utils/auth';

// Get settings (project info + user profile)
export async function getSettings(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    const settings = await settingsService.getSettings(user.userId);
    return res.json({ status: 'ok', ...settings });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to fetch settings');
  }
}

// Update project information (owner only)
export async function updateProject(req: RequestWithUser, res: Response) {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      return sendError(res, 400, 'Project name is required');
    }

    const project = await settingsService.updateProject({ name, description });
    return res.json({ status: 'ok', project });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to update project');
  }
}

// Update user profile
export async function updateProfile(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    const { first_name, last_name, email, password } = req.body;
    
    const updatedUser = await settingsService.updateProfile(user.userId, {
      first_name,
      last_name,
      email,
      password,
    });

    return res.json({ status: 'ok', user: updatedUser });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to update profile');
  }
}

// Update roles (owner only)
export async function updateRoles(req: RequestWithUser, res: Response) {
  try {
    const { roles, enable_roles, signup_enabled, default_role } = req.body;
    
    if (!Array.isArray(roles)) {
      return sendError(res, 400, 'Roles must be an array');
    }

  const project = await settingsService.updateRoles({ roles, enable_roles, signup_enabled, default_role });
    return res.json({ status: 'ok', project });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to update roles');
  }
}

// Reset project (owner only)
export async function resetProject(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    await settingsService.resetProject(user.userId);
    return res.json({ status: 'ok', message: 'Project reset successfully' });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to reset project');
  }
}

// Delete account (owner only - deletes everything)
export async function deleteAccount(req: RequestWithUser, res: Response) {
  try {
    const user = req.user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    await settingsService.deleteAccount(user.userId);
    return res.json({ status: 'ok', message: 'Account deleted successfully' });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to delete account');
  }
}
