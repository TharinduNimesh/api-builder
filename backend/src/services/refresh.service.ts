import { PrismaClient } from '@prisma/client';
import { signRefreshToken } from '../utils/auth';

const prisma = new PrismaClient();

export async function createRefreshTokenForUser(userId: string, expiresAt?: Date) {
  const token = signRefreshToken({ userId, email: '' });
  const created = await prisma.sysRefreshToken.create({ data: { token, userId, expiresAt } });
  return created.token as string;
}

export async function findRefreshToken(token: string) {
  return prisma.sysRefreshToken.findUnique({ where: { token } });
}

export async function revokeRefreshTokenById(tokenId: string) {
  return prisma.sysRefreshToken.update({ where: { id: tokenId }, data: { revoked: true } });
}

export async function revokeAllForUser(userId: string) {
  return prisma.sysRefreshToken.updateMany({ where: { userId }, data: { revoked: true } });
}

