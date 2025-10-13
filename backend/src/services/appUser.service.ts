import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma = new PrismaClient();

export async function listAppUsers(status?: 'all' | 'active' | 'inactive') {
  try {
    const where: any = {};
    if (status === 'active') where.status = 'active';
    if (status === 'inactive') where.status = { not: 'active' };
    const users = await prisma.appUser.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        status: true,
        createdAt: true,
      },
    });
    return users;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function setAppUserStatus(appUserId: string, isActive: boolean) {
  try {
    const status = isActive ? 'active' : 'inactive';
    const user = await prisma.appUser.update({
      where: { id: appUserId },
      data: { status },
      select: { id: true, status: true },
    });
    return user;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
