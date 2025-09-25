import { Request, Response } from 'express';
import * as tableService from '../services/table.service';
import { sendError } from '../utils/auth';

export async function createTable(req: Request, res: Response) {
  try {
    const { sql } = req.body || {};
    if (!sql || typeof sql !== 'string') return sendError(res, 400, 'Missing SQL');

    // warn if statement contains 'create or replace'
    const lower = sql.toLowerCase();
    const warnReplace = lower.includes('create or replace');

  const user = (req as any).user;
  const userId = user?.userId;
  const result = await tableService.createTable(sql, userId);
    return res.status(200).json({ status: 'ok', result, warnReplace });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to create table', e?.details);
  }
}

export async function listTables(req: Request, res: Response) {
  try {
    const rows = await tableService.listTables();
    return res.json({ status: 'ok', tables: rows });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to list tables', e?.details);
  }
}

export async function getColumns(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    if (!name) return sendError(res, 400, 'Missing table name');
    const fullName = `${schema}.${name}`;
    const cols = await tableService.getTableColumns(fullName);
    return res.json({ status: 'ok', columns: cols });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get columns', e?.details);
  }
}

export async function getRows(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    if (!name) return sendError(res, 400, 'Missing table name');
    const fullName = `${schema}.${name}`;
    const rows = await tableService.getTableRows(fullName, limit);
    return res.json({ status: 'ok', rows });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get rows', e?.details);
  }
}

export async function dropTable(req: Request, res: Response) {
  try {
    const schema = req.params.schema || 'public';
    const name = req.params.name;
    if (!name) return sendError(res, 400, 'Missing table name');
    const fullName = `${schema}.${name}`;
    const result = await tableService.dropTable(fullName);
    return res.json({ status: 'ok', result });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to drop table', e?.details);
  }
}
