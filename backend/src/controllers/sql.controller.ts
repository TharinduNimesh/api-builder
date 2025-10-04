import { Request, Response } from 'express';
import * as sqlService from '../services/sql.service';
import { sendError } from '../utils/auth';

export async function executeQuery(req: Request, res: Response) {
  try {
    const { sql } = req.body || {};
    if (!sql || typeof sql !== 'string') {
      return sendError(res, 400, 'SQL query is required');
    }

    const user = (req as any).user;
    const userId = user?.userId;

    const result = await sqlService.executeQuery(sql, userId);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to execute query', e?.details);
  }
}

export async function getQueryHistory(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const history = await sqlService.getQueryHistory(userId, limit);
    return res.json({ status: 'ok', history });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get query history', e?.details);
  }
}

export async function getAllQueryHistory(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await sqlService.getAllQueryHistory(userId, page, pageSize);
    return res.json({ status: 'ok', ...result });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get query history', e?.details);
  }
}

export async function saveSnippet(req: Request, res: Response) {
  try {
    const { name, query, description } = req.body || {};
    if (!name || !query) {
      return sendError(res, 400, 'Name and query are required');
    }

    const user = (req as any).user;
    const userId = user?.userId;

    const result = await sqlService.saveSnippet(name, query, description || null, userId);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to save snippet', e?.details);
  }
}

export async function getSnippets(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const snippets = await sqlService.getSnippets(userId, limit);
    return res.json({ status: 'ok', snippets });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get snippets', e?.details);
  }
}

export async function getAllSnippets(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await sqlService.getAllSnippets(userId, page, pageSize);
    return res.json({ status: 'ok', ...result });
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to get snippets', e?.details);
  }
}

export async function updateSnippet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, query, description } = req.body || {};
    
    if (!id) return sendError(res, 400, 'Snippet ID is required');
    if (!name || !query) {
      return sendError(res, 400, 'Name and query are required');
    }

    const user = (req as any).user;
    const userId = user?.userId;

    const result = await sqlService.updateSnippet(id, name, query, description || null, userId);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 400, e?.message || 'Failed to update snippet', e?.details);
  }
}

export async function deleteSnippet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, 400, 'Snippet ID is required');

    const user = (req as any).user;
    const userId = user?.userId;

    const result = await sqlService.deleteSnippet(id, userId);
    return res.json(result);
  } catch (err: unknown) {
    const e: any = err;
    return sendError(res, 500, e?.message || 'Failed to delete snippet', e?.details);
  }
}
