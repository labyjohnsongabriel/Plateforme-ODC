import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodEffects } from 'zod';
import { ValidationError } from '../errors/AppError';

type ZodSchema = AnyZodObject | ZodEffects<AnyZodObject>;

export interface ValidationSource {
  body?: boolean;
  query?: boolean;
  params?: boolean;
}

/**
 * Valide body / query / params avec un ou plusieurs schémas Zod
 */
export function validate(
  schema: ZodSchema,
  source: ValidationSource = { body: true, query: true, params: true }
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const payload: any = {};
      if (source.body) payload.body = req.body;
      if (source.query) payload.query = req.query;
      if (source.params) payload.params = req.params;

      await schema.parseAsync(payload);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.') || 'body',
          message: e.message,
          code: e.code,
        }));

        return next(new ValidationError('Erreur de validation des données', errors));
      }
      next(error);
    }
  };
}

/**
 * Validation multiple (plusieurs schémas successifs)
 */
export function validateMultiple(...schemas: ZodSchema[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const schema of schemas) {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(new ValidationError('Erreur de validation', errors));
      }
      next(error);
    }
  };
}

/**
 * Validation du body uniquement
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, { body: true, query: false, params: false });
}

/**
 * Validation des query params uniquement
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, { body: false, query: true, params: false });
}

/**
 * Validation des params uniquement
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, { body: false, query: false, params: true });
}