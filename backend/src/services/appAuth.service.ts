import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken, normalizeEmail } from '../utils/auth';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma: any = new PrismaClient();

function ensurePrismaModels() {
  // helpful runtime guard: if prisma.appUser (generated client) is missing,
  // the developer likely forgot to run `prisma generate` after editing the schema.
  if (!prisma || !prisma.appUser || !prisma.appRefreshToken || !prisma.appUserAuth) {
    throw new Error(
      'Prisma client does not include AppUser models. Run `npx prisma generate` and apply migrations (e.g. `npx prisma migrate dev --name add-app-user-models`) then restart the server.'
    );
  }
}

export async function signup({ firstName, lastName, email, password }: { firstName?: string; lastName?: string; email: string; password: string }) {
  const normalized = normalizeEmail(email);
  ensurePrismaModels();
  try {
    const existing = await prisma.appUser.findUnique({ where: { email: normalized } });
    if (existing) throw new Error('Email already in use');
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  let user: any;
  try {
    // fetch project settings for default role and signup policy
    const project = await (prisma as any).sysProject.findFirst();
    const defaultRole = project?.default_role || null;
    const signupEnabled = !!project?.signup_enabled;

    // If signup is explicitly disabled, block app user signup
    if (!signupEnabled) {
      throw new Error('Signups are disabled for this project');
    }

    // If there's a default role, ensure it exists in the project's roles
    let assignRoles: string[] | undefined = undefined;
    if (defaultRole) {
      const rolesList = Array.isArray(project?.roles) ? project?.roles : [];
      const roleNames = rolesList.map((r: any) => String(r?.name).trim());
      if (!roleNames.includes(String(defaultRole))) {
        throw new Error('Configured default_role does not match any defined project role');
      }
      assignRoles = [defaultRole];
    }

    user = await prisma.appUser.create({
      data: {
        firstName,
        lastName,
        email: normalized,
        roles: assignRoles,
        auth: { create: { password: hashed, provider: 'local' } },
      },
      include: { auth: true },
    });
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, type: 'app' });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, type: 'app' });

  // persist refresh token in AppRefreshToken
  await prisma.appRefreshToken.create({ data: { token: refreshToken, appUserId: user.id } });

  const safeUser = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, status: user.status, createdAt: user.createdAt };
  return { user: safeUser, accessToken, refreshToken };
}

export async function signin({ email, password }: { email: string; password: string }) {
  const normalized = normalizeEmail(email);
  ensurePrismaModels();
  const user = await prisma.appUser.findUnique({ where: { email: normalized }, include: { auth: true } });
  if (!user || !user.auth) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.auth.password);
  if (!ok) throw new Error('Invalid credentials');

  const accessToken = signAccessToken({ userId: user.id, email: user.email, type: 'app' });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, type: 'app' });
  await prisma.appRefreshToken.create({ data: { token: refreshToken, appUserId: user.id } });

  // update lastLogin
  try {
    await prisma.appUserAuth.update({ where: { appUserId: user.id }, data: { lastLogin: new Date() } });
  } catch (e) {
    // non-critical
  }

  const safeUser = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, status: user.status, createdAt: user.createdAt };
  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(token: string) {
  if (!token) throw new Error('No refresh token provided');
  ensurePrismaModels();
  const payload = verifyRefreshToken(token);
  // ensure token exists and is not revoked
  const stored = await prisma.appRefreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked) throw new Error('Invalid or revoked refresh token');
  const user = await prisma.appUser.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('Invalid refresh token');

  // revoke old and create new
  try {
    await prisma.appRefreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  } catch (e) {
    // non-critical
  }
  const newRefresh = signRefreshToken({ userId: user.id, email: user.email, type: 'app' });
  await prisma.appRefreshToken.create({ data: { token: newRefresh, appUserId: user.id } });
  const accessToken = signAccessToken({ userId: user.id, email: user.email, type: 'app' });
  return { accessToken, refreshToken: newRefresh };
}
