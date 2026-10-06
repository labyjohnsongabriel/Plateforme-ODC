/** Clés React Query centralisées. */
export const queryKeys = {
  /* ---------------- Auth ---------------- */
  auth: {
    me: ['auth', 'me'] as const,
  },

  /* ---------------- Users ---------------- */
  users: {
    all: ['users'] as const,
    list: (filters?: any) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: ['users', 'stats'] as const,
  },

  /* ---------------- Roles ---------------- */
  roles: {
    all: ['roles'] as const,
    list: ['roles', 'list'] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    permissions: ['roles', 'permissions'] as const,
  },

  /* ---------------- Formations ---------------- */
  formations: {
    all: ['formations'] as const,
    list: (filters?: any) => ['formations', 'list', filters] as const,
    public: (filters?: any) => ['formations', 'public', filters] as const,
    detail: (id: string) => ['formations', 'detail', id] as const,
    bySlug: (slug: string) => ['formations', 'slug', slug] as const,
    top: ['formations', 'top'] as const,
    stats: ['formations', 'stats'] as const,
  },

  /* ---------------- Domaines ---------------- */
  domaines: {
    all: ['domaines'] as const,
    public: ['domaines', 'public'] as const,
    detail: (id: string) => ['domaines', 'detail', id] as const,
    bySlug: (slug: string) => ['domaines', 'slug', slug] as const,
  },

  /* ---------------- Sessions ---------------- */
  sessions: {
    all: ['sessions'] as const,
    list: (filters?: any) => ['sessions', 'list', filters] as const,
    public: (filters?: any) => ['sessions', 'public', filters] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
    byCode: (code: string) => ['sessions', 'code', code] as const,
    mes: ['sessions', 'mes'] as const,
  },

  /* ---------------- Inscriptions ---------------- */
  inscriptions: {
    all: ['inscriptions'] as const,
    list: (filters?: any) => ['inscriptions', 'list', filters] as const,
    detail: (id: string) => ['inscriptions', 'detail', id] as const,
    bySession: (sessionId: string) => ['inscriptions', 'session', sessionId] as const,
  },

  /* ---------------- Présences ---------------- */
  presences: {
    all: ['presences'] as const,
    bySession: (sessionId: string) => ['presences', 'session', sessionId] as const,
    mes: ['presences', 'mes'] as const,
    stats: (sessionId: string) => ['presences', 'stats', sessionId] as const,
  },

  /* ---------------- Évaluations ---------------- */
  evaluations: {
    all: ['evaluations'] as const,
    bySession: (sessionId: string) => ['evaluations', 'session', sessionId] as const,
    detail: (id: string) => ['evaluations', 'detail', id] as const,
  },

  /* ---------------- Notes ---------------- */
  notes: {
    all: ['notes'] as const,
    mes: ['notes', 'mes'] as const,
    byEvaluation: (evaluationId: string) => ['notes', 'evaluation', evaluationId] as const,
  },

  /* ---------------- Attestations ---------------- */
  attestations: {
    all: ['attestations'] as const,
    mes: ['attestations', 'mes'] as const,
    byNumero: (numero: string) => ['attestations', 'numero', numero] as const,
  },

  /* ---------------- Ressources ---------------- */
  ressources: {
    all: ['ressources'] as const,
    bySession: (sessionId: string) => ['ressources', 'session', sessionId] as const,
  },

  /* ---------------- Partenaires ---------------- */
  partenaires: {
    all: ['partenaires'] as const,
    public: ['partenaires', 'public'] as const,
    detail: (id: string) => ['partenaires', 'detail', id] as const,
    fiche: ['partenaires', 'fiche'] as const,
  },

  /* ---------------- Réseautage ---------------- */
  reseau: {
    annuaire: (filters?: any) => ['reseau', 'annuaire', filters] as const,
    suggestions: ['reseau', 'suggestions'] as const,
    connexions: ['reseau', 'connexions'] as const,
    demandesEnAttente: ['reseau', 'demandes', 'en-attente'] as const,
    demandesEnvoyees: ['reseau', 'demandes', 'envoyees'] as const,
    stats: ['reseau', 'stats'] as const,
  },

  /* ---------------- Messagerie ---------------- */
  messagerie: {
    conversations: ['messagerie', 'conversations'] as const,
    conversation: (id: string) => ['messagerie', 'conversation', id] as const,
    messages: (id: string) => ['messagerie', 'messages', id] as const,
    nonLus: ['messagerie', 'non-lus'] as const,
  },

  /* ---------------- Notifications ---------------- */
  notifications: {
    all: ['notifications'] as const,
    nonLues: ['notifications', 'non-lues'] as const,
  },

  /* ---------------- Dashboard ---------------- */
  dashboard: {
    me: ['dashboard', 'me'] as const,
    admin: ['dashboard', 'admin'] as const,
    staff: ['dashboard', 'staff'] as const,
    formateur: ['dashboard', 'formateur'] as const,
    participant: ['dashboard', 'participant'] as const,
    partenaire: ['dashboard', 'partenaire'] as const,
  },
};