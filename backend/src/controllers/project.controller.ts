import { Request, Response } from 'express';
import { createProjectSchema } from '../validators/project.validator';
import * as projectService from '../services/project.service';
import { sendError } from '../utils/auth';

export async function createProject(req: Request, res: Response) {
  try {
    const parsed = createProjectSchema.parse(req.body);
    const user = (req as any).user;
    if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');

    const project = await projectService.createProject({
      name: parsed.name,
      enable_roles: parsed.enable_roles,
      roles: parsed.roles,
      is_protected: true, // protected by default
      createdById: user.userId,
    });
    return res.status(201).json({ status: 'ok', project });
  } catch (err: unknown) {
    const e: any = err;
    const details = e?.issues || e?.details || undefined;
    return sendError(res, 400, e?.message || 'Create project failed', details);
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const project = await projectService.getAnyProject();
    return res.json({ status: 'ok', project });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to fetch project');
  }
}
