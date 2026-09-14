export const MESSAGES = {
  AUTH: {
    TOKEN_REQUIRED: 'Token manquant',
    TOKEN_INVALID: 'Token invalide ou expire',
    UNAUTHORIZED: 'Non authentifie',
    FORBIDDEN: 'Acces refuse',
    LOGIN_SUCCESS: 'Connexion reussie',
    LOGIN_FAILED: 'Email ou mot de passe incorrect',
    REGISTER_SUCCESS: 'Inscription reussie',
    EMAIL_EXISTS: 'Cet email est deja utilise',
    PASSWORD_CHANGED: 'Mot de passe modifie',
  },
  USER: { NOT_FOUND: 'Utilisateur introuvable', CREATED: 'Utilisateur cree', UPDATED: 'Utilisateur mis a jour', DELETED: 'Utilisateur supprime' },
  FORMATION: { NOT_FOUND: 'Formation introuvable', CREATED: 'Formation creee', UPDATED: 'Formation mise a jour', DELETED: 'Formation supprimee' },
  SESSION: { NOT_FOUND: 'Session introuvable' },
  INSCRIPTION: { NOT_FOUND: 'Inscription introuvable', ALREADY_EXISTS: 'Deja inscrit' },
  GENERAL: { SUCCESS: 'Operation reussie', NOT_FOUND: 'Ressource introuvable', INTERNAL_ERROR: 'Erreur interne' },
} as const;