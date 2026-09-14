// ============================================================================
// ODC PLATFORM — Middlewares : Export centralisé
// Fichier : src/middlewares/index.ts
// ============================================================================

// ----------------------------------------------------------------------------
// AUTHENTIFICATION
// ----------------------------------------------------------------------------
export {
  authMiddleware,
  optionalAuthMiddleware,
} from './auth.middleware';

// ----------------------------------------------------------------------------
// RÔLES & PERMISSIONS
// ----------------------------------------------------------------------------
export {
  roleMiddleware,
  excludeRolesMiddleware,
  ownerOrAdminMiddleware,
} from './role.middleware';

export {
  permissionMiddleware,
  invalidatePermissionCache,
  getPermissionsForRole,
} from './permission.middleware';

// ----------------------------------------------------------------------------
// VALIDATION (Zod)
// ----------------------------------------------------------------------------
export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
} from './validate.middleware';

// ----------------------------------------------------------------------------
// GESTION DES ERREURS
// ----------------------------------------------------------------------------
export {
  errorMiddleware,
  asyncHandler,
} from './error.middleware';

export {
  notFoundMiddleware,
} from './notFound.middleware';

// ----------------------------------------------------------------------------
// UPLOAD (Multer)
// ----------------------------------------------------------------------------
export {
  upload,
  uploadAvatar,
  uploadDocument,
  uploadImage,
  uploadMultiple,
  SUBFOLDERS,
} from './upload.middleware';

// ----------------------------------------------------------------------------
// RATE LIMITING
// ----------------------------------------------------------------------------
export {
  globalLimiter,
  authLimiter,
  moderateLimiter,
  heavyLimiter,
  uploadLimiter,
  messageLimiter,
  generationLimiter,
} from './rateLimit.middleware';

// ----------------------------------------------------------------------------
// LOGGING
// ----------------------------------------------------------------------------
export {
  loggerMiddleware,
  logAction,
} from './logger.middleware';

// ----------------------------------------------------------------------------
// AUDIT
// ----------------------------------------------------------------------------
export {
  auditMiddleware,
  autoAuditMiddleware,
  auditLoginMiddleware,
  auditGenerationMiddleware,
  auditDownloadMiddleware,
} from './audit.middleware';

// ----------------------------------------------------------------------------
// PAGINATION
// ----------------------------------------------------------------------------
export {
  paginationMiddleware,
} from './pagination.middleware';