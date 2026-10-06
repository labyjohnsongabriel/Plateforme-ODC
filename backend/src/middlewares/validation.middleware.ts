// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodEffects } from 'zod';
import { BadRequestError } from '../errors/AppError';

type AnySchema = AnyZodObject | ZodEffects<AnyZodObject>;

export const validateRequest =
  (schema: AnySchema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed && typeof parsed === 'object') {
        if ('body' in parsed)   req.body   = (parsed as any).body;
        if ('query' in parsed)  req.query  = (parsed as any).query;
        if ('params' in parsed) req.params = (parsed as any).params;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new BadRequestError('Erreur de validation', errors));
      }
      next(err);
    }
  };

export const validateBody =
  (schema: AnySchema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({ body: req.body });
      if (parsed && typeof parsed === 'object' && 'body' in parsed) {
        req.body = (parsed as any).body;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new BadRequestError('Erreur de validation', errors));
      }
      next(err);
    }
  };