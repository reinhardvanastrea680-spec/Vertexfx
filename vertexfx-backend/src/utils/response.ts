import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function ok<T>(res: Response, data: T, message?: string, meta?: ApiResponse['meta']): Response {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

export function created<T>(res: Response, data: T, message?: string): Response {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function badRequest(res: Response, message: string, errors?: unknown): Response {
  return res.status(400).json({ success: false, message, errors });
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return res.status(403).json({ success: false, message });
}

export function notFound(res: Response, message = 'Not found'): Response {
  return res.status(404).json({ success: false, message });
}

export function conflict(res: Response, message: string): Response {
  return res.status(409).json({ success: false, message });
}

export function tooManyRequests(res: Response): Response {
  return res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
}

export function serverError(res: Response, message = 'Internal server error'): Response {
  return res.status(500).json({ success: false, message });
}

export function paginate(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
