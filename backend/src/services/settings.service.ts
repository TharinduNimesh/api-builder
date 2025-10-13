import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';
import bcrypt from 'bcryptjs';
import { dropTable } from './table.service';
import { dropFunction } from './function.service';

const prisma = new PrismaClient();

// Get settings (project + user profile)
export async function getSettings(userId: string) {
  try {
    const project = await prisma.sysProject.findFirst();
    const user = await prisma.sysUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isOwner = project ? project.createdById === userId : false;

    return {
      project: project || null,
      user,
      isOwner,
    };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to fetch settings');
  }
}

// Update project information
export async function updateProject(input: { name: string; description?: string }) {
  try {
    const project = await prisma.sysProject.findFirst();
    if (!project) {
      throw new Error('Project not found');
    }

    const updated = await prisma.sysProject.update({
      where: { id: project.id },
      data: {
        name: input.name,
        description: input.description,
      },
    });

    return updated;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to update project');
  }
}

// Update user profile
export async function updateProfile(
  userId: string,
  input: { first_name?: string; last_name?: string; email?: string; password?: string }
) {
  try {
    const data: any = {};

    if (input.first_name) data.first_name = input.first_name;
    if (input.last_name) data.last_name = input.last_name;
    if (input.email) data.email = input.email;
    
    // Hash password if provided
    if (input.password && input.password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(input.password, salt);
    }

    const updated = await prisma.sysUser.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
        createdAt: true,
      },
    });

    return updated;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to update profile');
  }
}

// Update roles
export async function updateRoles(input: { roles: any[]; enable_roles?: boolean; signup_enabled?: boolean; default_role?: string | null }) {
  try {
    const project = await prisma.sysProject.findFirst();
    if (!project) {
      throw new Error('Project not found');
    }

    // Validate default_role against the effective roles list
    const effectiveRoles = Array.isArray(input.roles) && input.roles.length ? input.roles : (Array.isArray(project.roles as any) ? (project.roles as any) : []);
    const effectiveEnableRoles = input.enable_roles !== undefined ? input.enable_roles : project.enable_roles;

    if (input.default_role !== undefined && input.default_role !== null && input.default_role !== '') {
      // If roles are not enabled, it's invalid to set a default role
      if (!effectiveEnableRoles) {
        throw new Error('Cannot set default_role when roles are disabled (enable_roles must be true)');
      }

      const roleNames = effectiveRoles.map((r: any) => String(r?.name).trim());
      if (!roleNames.includes(String(input.default_role))) {
        throw new Error('default_role must match one of the defined role names');
      }
    }

    const data: any = {
      roles: input.roles,
      enable_roles: effectiveEnableRoles,
    };
    if (typeof input.signup_enabled === 'boolean') data.signup_enabled = input.signup_enabled;
    if (input.default_role !== undefined) data.default_role = input.default_role || null;

    const updated = await prisma.sysProject.update({
      where: { id: project.id },
      data,
    });

    return updated;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to update roles');
  }
}

// Reset project - deletes all tables, functions, query history, and SQL snippets
export async function resetProject(userId: string) {
  try {
    // Verify user is the project owner
    const project = await prisma.sysProject.findFirst();
    if (!project || project.createdById !== userId) {
      throw new Error('Unauthorized to reset project');
    }

    // Get all tables and functions before deleting records
    const tables = await prisma.sysTable.findMany({
      select: { full_name: true }
    });
    
    const functions = await prisma.sysFunction.findMany({
      select: { full_name: true }
    });

    // Drop all tables from the database
    for (const table of tables) {
      try {
        await dropTable(table.full_name);
      } catch (err) {
        console.error(`Failed to drop table ${table.full_name}:`, err);
        // Continue even if one table fails
      }
    }

    // Drop all functions from the database
    for (const func of functions) {
      try {
        await dropFunction(func.full_name);
      } catch (err) {
        console.error(`Failed to drop function ${func.full_name}:`, err);
        // Continue even if one function fails
      }
    }

    // Delete all table records
    await prisma.sysTable.deleteMany({});
    
    // Delete all function records
    await prisma.sysFunction.deleteMany({});
    
    // Delete all query history
    await prisma.sysQueryHistory.deleteMany({});
    
    // Delete all SQL snippets
    await prisma.sysSqlSnippet.deleteMany({});

    // Reset project settings (optional - keeps the project but clears data)
    await prisma.sysProject.update({
      where: { id: project.id },
      data: {
        roles: [],
        enable_roles: false,
      },
    });

    return { message: 'Project reset successfully' };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to reset project');
  }
}

// Delete account - for owners: resets project and deletes account, for normal users: deactivates account
export async function deleteAccount(userId: string) {
  try {
    const project = await prisma.sysProject.findFirst();
    if (!project) {
      throw new Error('Project not found');
    }

    const isOwner = project.createdById === userId;

    if (isOwner) {
      // For owner: Reset project first, then delete all users and account
      
      // Get all tables and functions before deleting records
      const tables = await prisma.sysTable.findMany({
        select: { full_name: true }
      });
      
      const functions = await prisma.sysFunction.findMany({
        select: { full_name: true }
      });

      // Drop all tables from the database
      for (const table of tables) {
        try {
          await dropTable(table.full_name);
        } catch (err) {
          console.error(`Failed to drop table ${table.full_name}:`, err);
          // Continue even if one table fails
        }
      }

      // Drop all functions from the database
      for (const func of functions) {
        try {
          await dropFunction(func.full_name);
        } catch (err) {
          console.error(`Failed to drop function ${func.full_name}:`, err);
          // Continue even if one function fails
        }
      }
      
      // 1. Delete all table records
      await prisma.sysTable.deleteMany({});
      
      // 2. Delete all function records
      await prisma.sysFunction.deleteMany({});
      
      // 3. Delete all query history
      await prisma.sysQueryHistory.deleteMany({});
      
      // 4. Delete all SQL snippets
      await prisma.sysSqlSnippet.deleteMany({});

      // 5. Delete all other users (not the owner yet)
      await prisma.sysUser.deleteMany({
        where: {
          id: { not: userId }
        }
      });

      // 6. Delete the owner account (this will cascade delete the project and refresh tokens)
      await prisma.sysUser.delete({
        where: { id: userId },
      });

      return { 
        message: 'Account and project deleted successfully',
        isOwner: true 
      };
    } else {
      // For normal users: Just deactivate the account
      await prisma.sysUser.update({
        where: { id: userId },
        data: {
          is_active: false,
        },
      });

      return { 
        message: 'Account deactivated successfully',
        isOwner: false 
      };
    }
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    throw new Error(mapped?.message || 'Failed to delete/deactivate account');
  }
}
