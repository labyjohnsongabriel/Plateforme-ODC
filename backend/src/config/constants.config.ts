export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const UPLOAD_SUBFOLDERS = {
  AVATARS: 'avatars',
  FORMATIONS: 'formations',
  ATTESTATIONS: 'attestations',
  RESSOURCES: 'ressources',
  TEMP: 'temp',
} as const;

export const JWT_TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;