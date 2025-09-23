import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function getAnyProject() {
  return prisma.sysProject.findFirst();
}

export async function createProject(input: { name: string; enable_roles?: boolean; roles?: any[]; is_protected?: boolean; createdById: string }) {
  try {
    // enforce single project in DB
    const count = await prisma.sysProject.count();
    if (count > 0) throw new Error('Project already exists');

    // generate a compact, unique apiKey that includes a time-based middle and mixed-case chars
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rand = (len: number) => {
      const bytes = randomBytes(len);
      let out = '';
      for (let i = 0; i < bytes.length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
      return out;
    };
    const randGuaranteedMixed = (len: number) => {
      if (len < 2) return rand(len);
      let s = '';
      // loop until we have at least one lowercase and one uppercase char
      do {
        s = rand(len);
      } while (!/[a-z]/.test(s) || !/[A-Z]/.test(s));
      return s;
    };

    const timePart = Date.now().toString(36); // compact time-based component (lowercase + digits)
    const apiKey = `api_${randGuaranteedMixed(4)}${timePart}${randGuaranteedMixed(6)}`;

    const project = await prisma.sysProject.create({
      data: {
        name: input.name,
        createdById: input.createdById,
        enable_roles: !!input.enable_roles,
        roles: input.roles ? input.roles : undefined,
        is_protected: !!input.is_protected,
        api_key: apiKey,
      },
    });
    return project;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
