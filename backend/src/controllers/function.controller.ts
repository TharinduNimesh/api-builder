import { Request, Response } from 'express';
import * as functionService from '../services/function.service';
import { sendError } from '../utils/auth';

export async function createFunction(req: Request, res: Response) {
  try {
    const { sql } = req.body || {};
    if (!sql || typeof sql !== 'string') return sendError(res, 400, 'Missing SQL');

    const user = (req as any).user;
    const userId = user?.userId;
    const result = await functionService.createFunction(sql, userId);
    return res.status(200).json({ status: 'ok', result });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to create function', e?.details);
  }
}

export async function listFunctions(req: Request, res: Response) {
  try {
    const rows = await functionService.listFunctions();
    return res.json({ status: 'ok', functions: rows });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to list functions', e?.details);
  }
}

export async function getDefinition(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    if (!name) return sendError(res, 400, 'Missing function name');
    const fullName = `${schema}.${name}`;
    const def = await functionService.getFunctionDefinition(fullName);
    return res.json({ status: 'ok', definition: def });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get function definition', e?.details);
  }
}

export async function dropFunction(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    if (!name) return sendError(res, 400, 'Missing function name');
    const fullName = `${schema}.${name}`;
    const result = await functionService.dropFunction(fullName);
    return res.json({ status: 'ok', result });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to drop function', e?.details);
  }
}

export async function runFunction(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    if (!name) return sendError(res, 400, 'Missing function name');
    const fullName = `${schema}.${name}`;
    const { args } = req.body || {};
    const arr = Array.isArray(args) ? args : [];
    const result = await functionService.runFunction(fullName, arr);
    return res.json(result);
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to run function', e?.details);
  }
}
