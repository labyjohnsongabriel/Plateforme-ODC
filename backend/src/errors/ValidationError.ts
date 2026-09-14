import { AppError, ErrorCode } from './AppError';

export interface FieldError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

/**
 * 422 Unprocessable Entity
 * Les données sont syntaxiquement correctes mais invalides.
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Erreur de validation des données',
    public readonly errors: FieldError[] = []
  ) {
    super(message, {
      statusCode: 422,
      code: ErrorCode.VALIDATION_ERROR,
      details: errors,
    });
  }

  /**
   * Ajoute une erreur de champ
   */
  addError(field: string, message: string, code?: string, value?: any): this {
    this.errors.push({ field, message, code, value });
    return this;
  }

  /**
   * Retourne les erreurs groupées par champ
   */
  groupByField(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const err of this.errors) {
      if (!grouped[err.field]) grouped[err.field] = [];
      grouped[err.field].push(err.message);
    }
    return grouped;
  }

  /**
   * Indique si l'erreur contient des erreurs de champs
   */
  hasFieldErrors(): boolean {
    return this.errors.length > 0;
  }
}