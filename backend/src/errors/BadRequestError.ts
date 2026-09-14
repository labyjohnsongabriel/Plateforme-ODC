import { AppError, ErrorCode } from './AppError';

/**
 * 400 Bad Request
 * La requête est malformée ou contient des données invalides.
 */
export class BadRequestError extends AppError {
  constructor(message = 'Requête invalide', details?: any) {
    super(message, {
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      details,
    });
  }
}