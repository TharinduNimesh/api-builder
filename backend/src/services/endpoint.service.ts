import { PrismaClient, SysEndpoint } from '@prisma/client';
import { validateSQL } from '../utils/sqlValidator';

const prisma = new PrismaClient();

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface CreateEndpointInput {
  method: HttpMethod;
  path: string; // e.g. "/get-now"
  description?: string | null;
  sql: string;
  is_active?: boolean;
  params?: Array<{ name: string; in: 'path' | 'query' | 'body'; type?: 'string' | 'number' | 'boolean'; required?: boolean }>;
  is_protected?: boolean;
  allowed_roles?: string[]; // AppUser roles allowed when protected; empty/null means all
}

export async function listEndpoints(userId: string): Promise<SysEndpoint[]> {
  return prisma.sysEndpoint.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createEndpoint(input: CreateEndpointInput, userId: string): Promise<SysEndpoint> {
  if (!userId) throw new Error('Not authenticated');
  // validations
  const method = (input.method || '').toUpperCase() as HttpMethod;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
    throw new Error('Invalid HTTP method');
  }
  const path = (input.path || '').trim();
  if (!path.startsWith('/')) throw new Error('Path must start with "/"');
  if (path.includes(' ')) throw new Error('Path must not contain spaces');
  if (path.startsWith('/auth')) throw new Error('Path "/auth" is reserved');

  const sql = (input.sql || '').trim();
  if (!sql) throw new Error('SQL is required');
  const validation = validateSQL(sql);
  if (!validation.isValid) {
    throw new Error(`Invalid SQL: ${validation.errors.join('; ')}`);
  }

  // Reject SQL that is composed only of placeholders like {query}
  const withoutPlaceholders = sql.replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, '').replace(/["'`;]/g, '').trim();
  if (!/[a-zA-Z]/.test(withoutPlaceholders)) {
    throw new Error('SQL must include some static text and cannot be only placeholders.');
  }

  // Disallow using placeholders as identifiers (e.g., table or column names)
  // This prevents queries like: SELECT * FROM {table}; which cannot be safely parameterized.
  const identifierCtxRe = /\b(from|join|update|into|delete\s+from|truncate|alter\s+table|create\s+table)\s+\{([a-zA-Z_][a-zA-Z0-9_]*)\}/gi;
  const identifierHits: string[] = [];
  let idm: RegExpExecArray | null;
  while ((idm = identifierCtxRe.exec(sql)) !== null) {
    identifierHits.push(idm[2]);
  }
  if (identifierHits.length) {
    const uniq = Array.from(new Set(identifierHits));
    throw new Error(
      `Unsafe identifier interpolation detected for parameter(s): ${uniq.join(', ')}. ` +
      `Using parameters as table/column names is not supported. Use fixed identifiers or implement a whitelist server-side.`
    );
  }

  // Extract placeholders from sql: {name}
  const placeholderRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const sqlParams: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = placeholderRe.exec(sql)) !== null) {
    sqlParams.push(m[1]);
  }

  // Extract path params from path template
  const pathParamRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const pathParams: string[] = [];
  while ((m = pathParamRe.exec(path)) !== null) {
    pathParams.push(m[1]);
  }

  // Use provided params or infer defaults: path params in 'path', others from 'query'
  const provided = Array.isArray(input.params) ? input.params : [];
  const definedNames = new Set(provided.map(p => p.name));
  const params: CreateEndpointInput['params'] = [...provided];
  // Add missing path params
  pathParams.forEach(name => {
    if (!definedNames.has(name)) params!.push({ name, in: 'path', type: 'string', required: true });
  });
  // Add missing sql params default to query unless already present as path
  sqlParams.forEach(name => {
    if (!definedNames.has(name)) {
      const isPath = pathParams.includes(name);
      params!.push({ name, in: isPath ? 'path' : 'query', type: 'string', required: !isPath });
    }
  });

  // enforce uniqueness per method+path globally for now
  const exists = await prisma.sysEndpoint.findFirst({
    where: { method, path },
  }).catch(() => null);
  if (exists) throw new Error('Endpoint with same method and path already exists');

  return prisma.sysEndpoint.create({
    data: ({
      method,
      path,
      description: input.description || null,
      sql,
      is_active: input.is_active ?? true,
      is_protected: !!input.is_protected,
      ...(Array.isArray(input.allowed_roles) ? { allowed_roles: input.allowed_roles } : {}),
      ...(params && params.length ? { params: params as any } : {}),
      createdBy: { connect: { id: userId } },
    } as any),
  });
}

export async function deleteEndpoint(id: string, userId: string): Promise<void> {
  const ep = await prisma.sysEndpoint.findUnique({ where: { id } });
  if (!ep) throw new Error('Endpoint not found');
  if (ep.createdById !== userId) throw new Error('Not authorized to delete this endpoint');
  await prisma.sysEndpoint.delete({ where: { id } });
}

export async function updateEndpoint(id: string, input: CreateEndpointInput, userId: string): Promise<SysEndpoint> {
  if (!userId) throw new Error('Not authenticated');
  
  // Check if endpoint exists and user owns it
  const existing = await prisma.sysEndpoint.findUnique({ where: { id } });
  if (!existing) throw new Error('Endpoint not found');
  if (existing.createdById !== userId) throw new Error('Not authorized to update this endpoint');

  // validations (same as create)
  const method = (input.method || '').toUpperCase() as HttpMethod;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
    throw new Error('Invalid HTTP method');
  }
  const path = (input.path || '').trim();
  if (!path.startsWith('/')) throw new Error('Path must start with "/"');
  if (path.includes(' ')) throw new Error('Path must not contain spaces');
  if (path.startsWith('/auth')) throw new Error('Path "/auth" is reserved');

  const sql = (input.sql || '').trim();
  if (!sql) throw new Error('SQL is required');
  const validation = validateSQL(sql);
  if (!validation.isValid) {
    throw new Error(`Invalid SQL: ${validation.errors.join('; ')}`);
  }

  // Reject SQL that is composed only of placeholders
  const withoutPlaceholders = sql.replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, '').replace(/["'`;]/g, '').trim();
  if (!/[a-zA-Z]/.test(withoutPlaceholders)) {
    throw new Error('SQL must include some static text and cannot be only placeholders.');
  }

  // Disallow using placeholders as identifiers
  const identifierCtxRe = /\b(from|join|update|into|delete\s+from|truncate|alter\s+table|create\s+table)\s+\{([a-zA-Z_][a-zA-Z0-9_]*)\}/gi;
  const identifierHits: string[] = [];
  let idm: RegExpExecArray | null;
  while ((idm = identifierCtxRe.exec(sql)) !== null) {
    identifierHits.push(idm[2]);
  }
  if (identifierHits.length) {
    const uniq = Array.from(new Set(identifierHits));
    throw new Error(
      `Unsafe identifier interpolation detected for parameter(s): ${uniq.join(', ')}. ` +
      `Using parameters as table/column names is not supported. Use fixed identifiers or implement a whitelist server-side.`
    );
  }

  // Extract placeholders from sql and path
  const placeholderRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const sqlParams: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = placeholderRe.exec(sql)) !== null) {
    sqlParams.push(m[1]);
  }

  const pathParamRe = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const pathParams: string[] = [];
  while ((m = pathParamRe.exec(path)) !== null) {
    pathParams.push(m[1]);
  }

  // Use provided params or infer defaults
  const provided = Array.isArray(input.params) ? input.params : [];
  const definedNames = new Set(provided.map(p => p.name));
  const params: CreateEndpointInput['params'] = [...provided];
  
  // Add missing path params
  pathParams.forEach(name => {
    if (!definedNames.has(name)) params!.push({ name, in: 'path', type: 'string', required: true });
  });
  
  // Add missing sql params
  sqlParams.forEach(name => {
    if (!definedNames.has(name)) {
      const isPath = pathParams.includes(name);
      params!.push({ name, in: isPath ? 'path' : 'query', type: 'string', required: !isPath });
    }
  });

  // Check for duplicate method+path (excluding current endpoint)
  const duplicate = await prisma.sysEndpoint.findFirst({
    where: { 
      method, 
      path,
      id: { not: id }
    },
  }).catch(() => null);
  if (duplicate) throw new Error('Endpoint with same method and path already exists');

  return prisma.sysEndpoint.update({
    where: { id },
    data: ({
      method,
      path,
      description: input.description || null,
      sql,
      is_active: input.is_active ?? true,
      is_protected: !!input.is_protected,
      allowed_roles: Array.isArray(input.allowed_roles) ? input.allowed_roles : null,
      params: params && params.length ? params as any : null,
    } as any),
  });
}

export async function findActiveByMethodAndPath(method: string, path: string): Promise<SysEndpoint | null> {
  return prisma.sysEndpoint.findFirst({
    where: { method: method.toUpperCase(), path, is_active: true },
  });
}
