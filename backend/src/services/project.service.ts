import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function getAnyProject() {
  return prisma.sysProject.findFirst();
}

function makeApiKey() {
  // simpler stable apiKey generation: time-based + random hex
  const timePart = Date.now().toString(36);
  const rand = randomBytes(8).toString('hex');
  return `api_${timePart}_${rand}`;
}

export async function createProject(input: { name: string; enable_roles?: boolean; roles?: any[]; is_protected?: boolean; createdById: string; signup_enabled?: boolean; default_role?: string }) {
  try {
    // enforce single project in DB
    const count = await prisma.sysProject.count();
    if (count > 0) throw new Error('Project already exists');

    // Validate default_role if provided
    const enableRoles = !!input.enable_roles;
    const roles = Array.isArray(input.roles) ? input.roles : [];
    if (input.default_role !== undefined && input.default_role !== null && input.default_role !== '') {
      if (!enableRoles) throw new Error('Cannot set default_role when roles are disabled (enable_roles must be true)');
      const roleNames = roles.map((r: any) => String(r?.name).trim());
      if (!roleNames.includes(String(input.default_role))) {
        throw new Error('default_role must match one of the defined role names');
      }
    }

    const apiKey = makeApiKey();

    const data: any = {
      name: input.name,
      description: input.name,
      createdById: input.createdById,
      enable_roles: enableRoles,
      roles: roles.length ? roles : undefined,
      is_protected: !!input.is_protected,
      signup_enabled: !!input.signup_enabled,
      default_role: input.default_role || null,
      api_key: apiKey,
    };

    const project = await prisma.sysProject.create({ data });
    return project;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
