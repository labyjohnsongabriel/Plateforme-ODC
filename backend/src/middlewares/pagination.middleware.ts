import { Request, Response, NextFunction } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: Pagination;
    }
  }
}

/**
 * Middleware de pagination
 *
 * Exemple :
 * GET /formations?page=2&limit=10
 */
export const paginationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const pageValue = Number(req.query.page);
  const limitValue = Number(req.query.limit);

  const page =
    Number.isInteger(pageValue) && pageValue > 0
      ? pageValue
      : 1;

  const limit =
    Number.isInteger(limitValue) &&
    limitValue > 0
      ? Math.min(limitValue, 100)
      : 10;

  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset,
  };

  next();
};

export default paginationMiddleware;