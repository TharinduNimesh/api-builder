import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma = new PrismaClient();

export async function listUsers(status?: 'all' | 'active' | 'inactive') {
  try {
    const where: any = {};
    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;
    const users = await prisma.sysUser.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
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

export async function setUserStatus(userId: string, isActive: boolean) {
  try {
    const user = await prisma.sysUser.update({
      where: { id: userId },
      data: { is_active: isActive },
      select: { id: true, is_active: true },
    });
    return user;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
