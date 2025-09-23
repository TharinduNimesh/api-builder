import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken, normalizeEmail } from '../utils/auth';

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
  const existing = await prisma.sysUser.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(input.password, 10);
  // determine if this is the first user
  const count = await prisma.sysUser.count();
  const isFirst = count === 0;

  // create user via ORM; first user is_active = true, others default to false
  const user = await prisma.sysUser.create({
    data: {
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      password: hashed,
      is_active: isFirst,
    },
  });
  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

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
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

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
  const user = await prisma.sysUser.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('Invalid refresh token');
  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });
  return { accessToken, refreshToken };
}
