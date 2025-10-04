import { PrismaClient } from '@prisma/client';
import { validateSQL } from '../utils/sqlValidator';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma = new PrismaClient();

export interface ExecuteQueryResult {
  status: 'success' | 'error';
  rows?: any[];
  rowsAffected?: number;
  executionTime?: number;
  message?: string;
  warnings?: string[];
}

/**
 * Execute SQL query with validation and security checks
 */
export async function executeQuery(sql: string, userId: string): Promise<ExecuteQueryResult> {
  const startTime = performance.now();
  
  try {
    // Validate SQL for security
    const validation = validateSQL(sql);
    
    if (!validation.isValid) {
      const errorMsg = validation.errors.join('; ');
      await saveQueryHistory(sql, 'error', 0, 0, errorMsg, userId);
      throw new Error(errorMsg);
    }

    // Execute the query
    const trimmedSQL = sql.trim().toLowerCase();
    let result: any;
    let rowsAffected = 0;

    if (trimmedSQL.startsWith('select') || trimmedSQL.startsWith('with')) {
      // Query returns rows
      result = await prisma.$queryRawUnsafe(sql);
      rowsAffected = Array.isArray(result) ? result.length : 0;
    } else {
      // Command that modifies data
      const affected = await prisma.$executeRawUnsafe(sql);
      rowsAffected = typeof affected === 'number' ? affected : 0;
      result = [];
    }

    const executionTime = performance.now() - startTime;

    // Save to history
    await saveQueryHistory(sql, 'success', rowsAffected, executionTime, null, userId);

    return {
      status: 'success',
      rows: Array.isArray(result) ? result : [],
      rowsAffected,
      executionTime,
      warnings: validation.warnings,
      message: `Query executed successfully - ${rowsAffected} row(s) affected`
    };
  } catch (err: any) {
    const executionTime = performance.now() - startTime;
    const errorMessage = err?.message || 'Failed to execute query';
    
    // Save error to history
    await saveQueryHistory(sql, 'error', 0, executionTime, errorMessage, userId).catch(e => 
      console.error('Failed to save error history:', e)
    );

    const mapped = mapPrismaError(err);
    if (mapped) {
      throw Object.assign(new Error(mapped.message), { details: mapped.details });
    }
    throw err;
  }
}

/**
 * Save query execution to history
 */
async function saveQueryHistory(
  query: string,
  status: 'success' | 'error',
  rowsAffected: number,
  executionTime: number,
  errorMessage: string | null,
  userId: string
): Promise<void> {
  try {
    await prisma.sysQueryHistory.create({
      data: {
        query,
        status,
        rowsAffected,
        executionTime,
        errorMessage,
        userId
      }
    });
  } catch (err) {
    console.error('Failed to save query history:', err);
    // Don't throw - history saving failure shouldn't break the query execution
  }
}

/**
 * Get recent query history for a user
 */
export async function getQueryHistory(userId: string, limit: number = 10) {
  try {
    const history = await prisma.sysQueryHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return history;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Get all query history for a user (paginated)
 */
export async function getAllQueryHistory(userId: string, page: number = 1, pageSize: number = 20) {
  try {
    const skip = (page - 1) * pageSize;
    
    const [history, total] = await Promise.all([
      prisma.sysQueryHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.sysQueryHistory.count({ where: { userId } })
    ]);

    return {
      data: history,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Save SQL snippet
 */
export async function saveSnippet(name: string, query: string, description: string | null, userId: string) {
  try {
    // Validate SQL before saving
    const validation = validateSQL(query);
    if (!validation.isValid) {
      throw new Error(`Invalid SQL: ${validation.errors.join('; ')}`);
    }

    const snippet = await prisma.sysSqlSnippet.create({
      data: {
        name,
        query,
        description,
        userId
      }
    });

    return { status: 'ok', snippet };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Get recent snippets for a user
 */
export async function getSnippets(userId: string, limit: number = 10) {
  try {
    const snippets = await prisma.sysSqlSnippet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });
    return snippets;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Get all snippets for a user (paginated)
 */
export async function getAllSnippets(userId: string, page: number = 1, pageSize: number = 20) {
  try {
    const skip = (page - 1) * pageSize;
    
    const [snippets, total] = await Promise.all([
      prisma.sysSqlSnippet.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.sysSqlSnippet.count({ where: { userId } })
    ]);

    return {
      data: snippets,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Update SQL snippet
 */
export async function updateSnippet(id: string, name: string, query: string, description: string | null, userId: string) {
  try {
    // Validate SQL before updating
    const validation = validateSQL(query);
    if (!validation.isValid) {
      throw new Error(`Invalid SQL: ${validation.errors.join('; ')}`);
    }

    const snippet = await prisma.sysSqlSnippet.update({
      where: { id, userId },
      data: {
        name,
        query,
        description
      }
    });

    return { status: 'ok', snippet };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

/**
 * Delete SQL snippet
 */
export async function deleteSnippet(id: string, userId: string) {
  try {
    await prisma.sysSqlSnippet.delete({
      where: { id, userId }
    });
    return { status: 'ok' };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
