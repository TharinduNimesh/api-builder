import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken, normalizeEmail } from '../utils/auth';
import { createRefreshTokenForUser, findRefreshToken, revokeRefreshTokenById } from './refresh.service';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma = new PrismaClient();

interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function signup(input: SignupInput) {
  const email = normalizeEmail(input.email);
  // check existing by email
  try {
    const existing = await prisma.sysUser.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }

  const hashed = await bcrypt.hash(input.password, 10);
  // determine if this is the first user
  const count = await prisma.sysUser.count();
  const isFirst = count === 0;

  // create user via ORM; first user is_active = true, others default to false
  let user: any;
  try {
    user = await prisma.sysUser.create({
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        email,
        password: hashed,
        is_active: isFirst,
      },
    });
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  // persist refresh token in DB
  const refreshToken = await createRefreshTokenForUser(user.id);

  // remove sensitive fields before returning
  // note: keep only minimal user fields
  const safeUser = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_active: user.is_active,
    createdAt: user.createdAt,
  };

  return { user: safeUser, accessToken, refreshToken };
}

export async function signin({ email, password }: { email: string; password: string }) {
  const normalized = normalizeEmail(email);
  const user = await prisma.sysUser.findUnique({ where: { email: normalized } });
  if (!user) throw new Error('Invalid credentials');
  if (!user.is_active) throw new Error('Account not active');
  const hashed = user.password;
  if (!hashed) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, hashed);
  if (!ok) throw new Error('Invalid credentials');

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = await createRefreshTokenForUser(user.id);

  const safeUser = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_active: user.is_active,
    createdAt: user.createdAt,
  };

  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(token: string) {
  if (!token) throw new Error('No refresh token provided');
  const payload = verifyRefreshToken(token);
  // ensure token exists and is not revoked
  const stored = await findRefreshToken(token);
  if (!stored || stored.revoked) throw new Error('Invalid or revoked refresh token');
  const user = await prisma.sysUser.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('Invalid refresh token');
  // rotate tokens: revoke old and create a new one
  try {
    await revokeRefreshTokenById(stored.id);
  } catch (e) {
    // not critical if revoke fails
  }
  const newRefresh = await createRefreshTokenForUser(user.id);
  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  return { accessToken, refreshToken: newRefresh };
}
