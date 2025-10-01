import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';
import { validateAndParseFunctionSQL, validateFunctionSecurity } from '../utils/functionValidator';

const prisma = new PrismaClient();

export async function listFunctions() {
  try {
    // If Prisma generated client has the sysFunction model available, use it.
    const clientAny = prisma as any;
    if (clientAny && clientAny.sysFunction && typeof clientAny.sysFunction.findMany === 'function') {
      const metadata = await clientAny.sysFunction.findMany({ orderBy: { createdAt: 'desc' } });
      
      // Fetch current functions from pg_catalog to merge with metadata
      const pgFunctions: any = await prisma.$queryRawUnsafe(
        `select n.nspname as schema, p.proname as name, pg_get_function_arguments(p.oid) as parameters, pg_get_function_result(p.oid) as return_type from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname not in ('pg_catalog','information_schema') order by p.proname`
      );
      
      // Create a map of current functions
      const pgFuncMap = new Map();
      (pgFunctions || []).forEach((fn: any) => {
        pgFuncMap.set(`${fn.schema}.${fn.name}`, fn);
      });
      
      // Merge metadata with current pg functions, filtering out stale metadata
      const merged = metadata
        .filter((meta: any) => pgFuncMap.has(meta.full_name))
        .map((meta: any) => {
          const pgFunc = pgFuncMap.get(meta.full_name);
          return {
            ...meta,
            parameters: meta.parameters || pgFunc?.parameters,
            return_type: meta.return_type || pgFunc?.return_type,
          };
        });
      
      // Add any pg functions not in metadata
      pgFunctions.forEach((pgFunc: any) => {
        const fullName = `${pgFunc.schema}.${pgFunc.name}`;
        if (!metadata.find((m: any) => m.full_name === fullName)) {
          merged.push({
            name: pgFunc.name,
            schema: pgFunc.schema,
            full_name: fullName,
            parameters: pgFunc.parameters,
            return_type: pgFunc.return_type,
          });
        }
      });
      
      return merged;
    }

    // Fallback: list functions from pg_catalog (pg_proc) when metadata table isn't available.
    const rows: any = await prisma.$queryRawUnsafe(
      `select n.nspname as schema, p.proname as name, pg_get_function_arguments(p.oid) as parameters, pg_get_function_result(p.oid) as return_type, pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname not in ('pg_catalog','information_schema') order by p.proname desc`
    );
    return (rows || []).map((r: any) => ({
      name: r.name,
      schema: r.schema,
      parameters: r.parameters,
      return_type: r.return_type,
      definition: r.definition,
    }));
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function getFunctionDefinition(fullName: string) {
  try {
    const parts = fullName.split('.');
    const schema = parts.length === 2 ? parts[0] : 'public';
    const name = parts.length === 2 ? parts[1] : parts[0];
    // try to fetch definition from pg_proc and pg_get_functiondef
    const res: any = await prisma.$queryRawUnsafe(
      `select p.proname as name, n.nspname as schema, pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = $1 and p.proname = $2 limit 1`,
      schema,
      name,
    );
    return res && res[0] ? res[0] : null;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function createFunction(sql: string, userId: string) {
  try {
    // Validate and parse the SQL statement with enhanced security checks
    const metadata = validateAndParseFunctionSQL(sql);
    validateFunctionSecurity(sql);

    // Execute the SQL
    await prisma.$executeRawUnsafe(sql);

    // Attempt to upsert metadata in SysFunction table
    try {
      const clientAny = prisma as any;
      if (clientAny && clientAny.sysFunction && typeof clientAny.sysFunction.findUnique === 'function') {
        const existing = await clientAny.sysFunction.findUnique({ 
          where: { full_name: metadata.fullName } 
        });
        
        if (existing) {
          await clientAny.sysFunction.update({ 
            where: { full_name: metadata.fullName }, 
            data: { 
              definition: sql,
              parameters: metadata.parameters,
              return_type: metadata.returnType,
              updatedById: userId 
            } 
          });
        } else {
          await clientAny.sysFunction.create({ 
            data: { 
              name: metadata.name,
              schema: metadata.schema,
              full_name: metadata.fullName,
              parameters: metadata.parameters,
              return_type: metadata.returnType,
              definition: sql,
              createdById: userId 
            } 
          });
        }
      }
    } catch (e) {
      console.warn('Failed to upsert function metadata', e);
    }

    return { 
      status: 'ok', 
      function: { 
        name: metadata.name, 
        schema: metadata.schema, 
        full_name: metadata.fullName,
        parameters: metadata.parameters,
        return_type: metadata.returnType
      } 
    };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function dropFunction(fullName: string) {
  try {
    // try drop all overloads with CASCADE
    await prisma.$executeRawUnsafe(`drop function if exists ${fullName} cascade`);
    try {
      const clientAny = prisma as any;
      if (clientAny && clientAny.sysFunction && typeof clientAny.sysFunction.delete === 'function') {
        await clientAny.sysFunction.delete({ where: { full_name: fullName } });
      }
    } catch (e) {
      console.warn('Failed to delete sysFunction metadata after drop', e);
    }
    return { status: 'ok' };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function runFunction(fullName: string, args: any[] = []) {
  try {
    // basic validation: block system schemas
    const parts = fullName.split('.');
    const schema = parts.length === 2 ? parts[0] : 'public';
    if (/^(pg_|pg_catalog|information_schema|sys)/i.test(schema)) {
      throw new Error('Running functions in system schemas is not allowed');
    }

    // Build parameter placeholders
    const placeholders = args.map((_, idx) => `$${idx + 1}`).join(',');
    const call = placeholders.length > 0 ? `${fullName}(${placeholders})` : `${fullName}()`;

    // Execute SELECT to retrieve result rows (works for setof and scalar-returning functions)
    const query = `select * from ${call}`;
    const rows: any = await prisma.$queryRawUnsafe(query, ...args);
    return { status: 'ok', rows };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
