import { Response, NextFunction } from 'express';
import { RequestWithUser, sendError } from '../utils/auth';
import * as projectService from '../services/project.service';

// Ensure the authenticated user is the creator (owner) of the single project
export async function ensureProjectOwner(req: RequestWithUser, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');
  try {
    const project = await projectService.getAnyProject();
    if (!project) return sendError(res, 403, 'No project exists');
    if (project.createdById !== user.userId) return sendError(res, 403, 'Forbidden');
    return next();
  } catch (err: any) {
    return sendError(res, 500, err?.message || 'Failed to verify project owner');
  }
}

// Ensure the authenticated user account is active (can view users)
export async function ensureActiveUser(req: RequestWithUser, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || !user.userId) return sendError(res, 401, 'Unauthorized');
  // lazy import prisma to avoid cycles
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const dbUser = await prisma.sysUser.findUnique({ where: { id: user.userId } });
    await prisma.$disconnect();
    if (!dbUser) return sendError(res, 401, 'Unauthorized');
    if (!dbUser.is_active) return sendError(res, 403, 'Account not active');
    return next();
  } catch (err: any) {
    return sendError(res, 500, err?.message || 'Failed to verify user');
  }
}
