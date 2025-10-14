import { Request, Response } from 'express';
import * as endpointService from '../services/endpoint.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function list(req: Request, res: Response) {
  try {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    const endpoints = await endpointService.listEndpoints(userId);
    res.json({ status: 'ok', endpoints });
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    const endpoint = await endpointService.createEndpoint(req.body, userId);
    res.json({ status: 'ok', endpoint });
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    await endpointService.deleteEndpoint(req.params.id, userId);
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    const endpoint = await endpointService.updateEndpoint(req.params.id, req.body, userId);
    res.json({ status: 'ok', endpoint });
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

// Dynamic executor for /api/b/*
export async function dynamicExecute(req: Request, res: Response) {
  try {
    const method = req.method.toUpperCase();
    const requestPath = '/' + (req.params[0] || ''); // wildcard capture

    // We need to fetch all active endpoints for method and try to template-match path with {param}
    const candidate = await prisma.sysEndpoint.findMany({ where: { method, is_active: true } });
    let endpoint: any = null;
    let pathParams: Record<string, string> = {};
    for (const ep of candidate) {
      const match = matchPathTemplate(ep.path, requestPath);
      if (match.matched) {
        endpoint = ep;
        pathParams = match.params;
        break;
      }
    }
    if (!endpoint) return res.status(404).json({ status: 'error', message: 'Endpoint not found' });

    // If endpoint is protected, validate Bearer token. Accept both SysUser and AppUser tokens.
    if (endpoint.is_protected) {
      const auth = req.headers['authorization'];
      if (!auth) return res.status(401).json({ status: 'error', message: 'Missing authorization header' });
      const parts = String(auth).split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ status: 'error', message: 'Invalid authorization header' });
      let payload: any;
      try {
        // Reuse access token verifier; payload may contain type: 'app' for AppUser
        const { verifyAccessToken } = await import('../utils/auth');
        payload = verifyAccessToken(parts[1]);
      } catch (e) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
      }
      // If AppUser, enforce status active and role access when allowed_roles defined
      if (payload?.type === 'app') {
        const appUser = await prisma.appUser.findUnique({ where: { id: payload.userId } });
        if (!appUser) return res.status(401).json({ status: 'error', message: 'Invalid token user' });
        if (appUser.status !== 'active') return res.status(403).json({ status: 'error', message: 'User not active' });
        const allowed: string[] | null = Array.isArray(endpoint.allowed_roles) ? endpoint.allowed_roles as any : null;
        if (allowed && allowed.length) {
          const roles: string[] = Array.isArray(appUser.roles) ? appUser.roles as any : [];
          const has = roles.some(r => allowed.includes(String(r)));
          if (!has) return res.status(403).json({ status: 'error', message: 'Forbidden: role not allowed' });
        }
      } else {
        // SysUser token: ensure user exists and is_active
        const sysUser = await prisma.sysUser.findUnique({ where: { id: payload.userId } });
        if (!sysUser) return res.status(401).json({ status: 'error', message: 'Invalid token user' });
        if (!sysUser.is_active) return res.status(403).json({ status: 'error', message: 'User not active' });
      }
    }

    // For now, ignore params mapping and just run the raw SQL.
    // Consider parameter binding in future iteration.
    // Build parameters map from defined params metadata
    const metaParams = Array.isArray(endpoint.params) ? (endpoint.params as any[]) : [];
    const values: Record<string, any> = {};
    for (const p of metaParams) {
      const source = p.in || 'query';
      if (source === 'path') values[p.name] = pathParams[p.name];
      else if (source === 'query') values[p.name] = (req.query as any)[p.name];
      else if (source === 'body') values[p.name] = (req.body || {})[p.name];
      // basic type coercion
      if (values[p.name] != null && p.type === 'number') values[p.name] = Number(values[p.name]);
      if (values[p.name] != null && p.type === 'boolean') values[p.name] = String(values[p.name]).toLowerCase() === 'true';
      if ((p.required ?? false) && (values[p.name] === undefined || values[p.name] === null || values[p.name] === '')) {
        return res.status(400).json({ status: 'error', message: `Missing required parameter: ${p.name}` });
      }
    }

    // Replace placeholders {name} in SQL with literal-safe values. For safety, we only inject primitives.
    // NOTE: This uses unsafe interpolation; for production, switch to prepared statements and proper binding.
    let sqlToRun = endpoint.sql as string;
    sqlToRun = sqlToRun.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_s, name) => {
      const v = values[name];
      if (v === undefined || v === null) return 'NULL';
      if (typeof v === 'number') return String(v);
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      // escape single quotes
      return `'${String(v).replace(/'/g, "''")}'`;
    });

    const start = performance.now();
    let result: any;
    let rowsAffected = 0;

    const trimmed = sqlToRun.trim().toLowerCase();
    if (trimmed.startsWith('select') || trimmed.startsWith('with')) {
      result = await prisma.$queryRawUnsafe(sqlToRun);
      rowsAffected = Array.isArray(result) ? result.length : 0;
    } else {
      const affected = await prisma.$executeRawUnsafe(sqlToRun);
      rowsAffected = typeof affected === 'number' ? affected : 0;
      result = [];
    }

    const executionTime = performance.now() - start;
    res.json({ status: 'success', rows: Array.isArray(result) ? result : [], rowsAffected, executionTime });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message || 'Failed to execute endpoint' });
  }
}

// Simple path template matcher: supports segments like /foo/{id}/bar
function matchPathTemplate(template: string, actual: string): { matched: boolean; params: Record<string, string> } {
  const tSegs = template.split('/').filter(Boolean);
  const aSegs = actual.split('/').filter(Boolean);
  if (tSegs.length !== aSegs.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < tSegs.length; i++) {
    const ts = tSegs[i];
    const as = aSegs[i];
    const m = /^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/.exec(ts);
    if (m) {
      params[m[1]] = decodeURIComponent(as);
    } else if (ts !== as) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}
