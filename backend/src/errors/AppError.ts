export class AppError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable') { super(message, 404); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorise') { super(message, 401); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Acces refuse') { super(message, 403); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflit') { super(message, 409); }
}
export class ValidationError extends AppError {
  public errors: any;
  constructor(message = 'Erreur de validation', errors?: any) {
    super(message, 422);
    this.errors = errors;
  }
}