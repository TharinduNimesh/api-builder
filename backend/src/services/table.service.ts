import { PrismaClient } from '@prisma/client';
import { mapPrismaError } from '../utils/prismaErrors';

const prisma = new PrismaClient();

function isCreateOrReplaceTable(sql: string) {
  const s = sql.trim().toLowerCase();
  return s.startsWith('create table') || s.startsWith('create or replace table') || s.startsWith('create or replace view') === false;
}

// Very small lightweight validations per requirements
function validateCreateTableSql(sql: string) {
  const normalized = sql.trim();
  const lower = normalized.toLowerCase();

  // allow 'create table' or 'create or replace table'
  if (!lower.startsWith('create table') && !lower.startsWith('create or replace table')) {
    throw new Error('Only CREATE TABLE or CREATE OR REPLACE TABLE statements are allowed');
  }

  // extract table identifier after CREATE [OR REPLACE] TABLE
  const match = normalized.match(/create(?:\s+or\s+replace)?\s+table\s+([\w."']+)/i);
  if (!match) throw new Error('Unable to parse table name');
  let tableIdent = match[1];

  // strip optional quoting
  tableIdent = tableIdent.replace(/['"]+/g, '');

  // handle schema.table
  const parts = tableIdent.split('.').map((p) => p.trim());
  if (parts.length === 2) {
    const schema = parts[0].toLowerCase();
    if (schema !== 'public') throw new Error('Only the public schema is permitted');
  }

  const tableName = parts[parts.length - 1];
  if (/^sys/i.test(tableName)) throw new Error('Table names starting with "sys" are reserved');

  // naive check: ensure no column definitions refer to sys* tables (look for references to sys in the body)
  const bodyMatch = normalized.match(/\([\s\S]*\)/);
  if (bodyMatch) {
    const body = bodyMatch[0].toLowerCase();
    if (/\b(sys[a-z0-9_]*)\b/.test(body)) {
      throw new Error('Column definitions must not reference system tables');
    }
  }

  return { tableName };
}

export async function createTable(sql: string, userId: string) {
  try {
    const parsed = validateCreateTableSql(sql);

    // determine schema and full name
    const match = sql.trim().match(/create(?:\s+or\s+replace)?\s+table\s+([\w."']+)/i);
    let tableIdent = match ? match[1].replace(/['"]+/g, '') : parsed.tableName;
    const parts = tableIdent.split('.').map((p) => p.trim());
    let schema = 'public';
    let name = parts[parts.length - 1];
    if (parts.length === 2) schema = parts[0];
    const fullName = `${schema}.${name}`;

    // check existence
    const existsRes: any = await prisma.$queryRawUnsafe(
      `select to_regclass($1) is not null as exists`,
      fullName,
    );
    // note: prisma.$queryRawUnsafe returns raw result depending on driver; we'll use information_schema check as fallback
    const exists = existsRes && existsRes[0] && (existsRes[0].exists === true || existsRes[0].exists === 't')
      ? true
      : false;

    // execute the SQL
    const execRes = await prisma.$executeRawUnsafe(sql);

    // Parse columns (naive): extract text inside parentheses and split by commas at top level
    const bodyMatch = sql.match(/\(([\s\S]*)\)/);
    let columns: string[] | undefined = undefined;
    if (bodyMatch) {
      const body = bodyMatch[1];
      // split by commas not inside parentheses (very naive but workable for simple column lists)
      columns = body
        .split(/,(?![^()]*\))/)
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          // take the first token as column name if available
          const m = c.match(/^(["`]?\w+['"]?)/);
          return m ? m[1].replace(/['"`]/g, '') : c;
        });
    }

    // upsert sysTable record
    try {
      if (exists) {
        // update
        await prisma.sysTable.update({
          where: { full_name: fullName },
          data: {
            schema,
            name,
            columns: columns ? { columns } : undefined,
            updatedById: userId,
          },
        });
      } else {
        // create
        await prisma.sysTable.create({
          data: {
            full_name: fullName,
            schema,
            name,
            columns: columns ? { columns } : undefined,
            createdById: userId,
          },
        });
      }
    } catch (e) {
      // ignore metadata write errors but surface SQL execution errors above
      console.warn('Failed to upsert sysTable metadata', e);
    }

    return execRes;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function listTables() {
  try {
    return await prisma.sysTable.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function getTableColumns(fullName: string) {
  try {
    // fullName expected as schema.name
    const parts = fullName.split('.');
    const schema = parts.length === 2 ? parts[0] : 'public';
    const name = parts.length === 2 ? parts[1] : parts[0];
    const cols: any = await prisma.$queryRawUnsafe(
      `select column_name, data_type, is_nullable from information_schema.columns where table_schema = $1 and table_name = $2 order by ordinal_position`,
      schema,
      name,
    );
    return cols;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function getTableRows(fullName: string, limit = 50) {
  try {
    // simple select limited
    const safeSql = `select * from ${fullName} limit $1`;
    // Note: using $executeRawUnsafe with parameter avoids Prisma parameterization for identifiers; so we use direct interpolation only after validation
    const rows: any = await prisma.$queryRawUnsafe(`select * from ${fullName} limit ${Number(limit)}`);
    return rows;
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}

export async function dropTable(fullName: string) {
  try {
    // attempt to drop the table
    await prisma.$executeRawUnsafe(`drop table if exists ${fullName} cascade`);
    // on success, remove metadata entry
    try {
      await prisma.sysTable.delete({ where: { full_name: fullName } });
    } catch (e) {
      // log but do not fail if metadata deletion fails
      console.warn('Failed to delete sysTable metadata after drop', e);
    }
    return { status: 'ok' };
  } catch (err: any) {
    const mapped = mapPrismaError(err);
    if (mapped) throw Object.assign(new Error(mapped.message), { details: mapped.details });
    throw err;
  }
}
